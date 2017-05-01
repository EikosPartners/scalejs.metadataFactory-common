'use strict';

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

require('datatables.net');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: should we remove this?
/* eslint no-unused-vars: ["error", { "args": "none"}] */
/* eslint new-cap: "off" */

_jquery2.default.fn.dataTable.ext.errMode = 'none';

// TODO: clean up approach to client vs serverside for search, filter and sorting
// add disable option on individual columns sort

_knockout2.default.bindingHandlers.dataTables = {
    init: function init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var settings = _lodash2.default.cloneDeep(_knockout2.default.unwrap(valueAccessor())),
            rows = settings.rows,
            columns = settings.columns,
            registry = settings.registry,
            hasChildren = settings.hasChildren,
            sort = settings.sort,
            columnsMap = {},
            subs = [],
            sortAscClass = 'sorting_asc',
            sortDescClass = 'sorting_desc';

        var showChildIcon = void 0,
            hideChildIcon = void 0,
            scrollElm = void 0,
            table = void 0;

        if (hasChildren) {
            showChildIcon = _lodash2.default.get(hasChildren, 'showIcon', 'fp fp-plus-square-o');
            hideChildIcon = _lodash2.default.get(hasChildren, 'hideIcon', 'fp fp-minus-square-o');
        }

        function scrollListener() {
            var body = document.body,
                html = document.documentElement;
            var height = void 0;

            if (scrollElm) {
                height = Math.max(scrollElm.scrollHeight, scrollElm.offsetHeight, scrollElm.clientHeight);
                if (scrollElm.scrollTop === scrollElm.scrollHeight - scrollElm.offsetHeight) {
                    settings.query();
                }
            } else {
                // accurately calculate the height of the document
                // crossbrowser compatible
                height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                if (height - window.innerHeight - window.pageYOffset <= 2) {
                    settings.query();
                }
            }
        }

        function setupColumns() {
            var columnWidth = 100 / columns.length;

            columns.forEach(function (col, idx) {
                var model = col;
                columnsMap[model.data] = model; // create column dictionary

                col.name = col.data;
                if (col.header) {
                    col.className = (col.classes || col.className || '') + ' custom-header';
                }

                if (col.template) {
                    col.className = (col.classes || col.className || '') + ' ko-template';
                }

                if (col.pinned) {
                    col.className = (col.classes || col.className || '') + ' all';
                }

                if (col.renderFunction && registry) {
                    col.render = registry.get(col.renderFunction);
                }

                if (!col.width) {
                    col.width = columnWidth + "%";
                }
            });

            settings.headerCallback = _headerCallback;
            settings.createdRow = _createdRow;

            if (hasChildren && columns[0] && !hasChildren.onRowSelect) {
                if (columns[0].className && columns[0].className.indexOf('child-control') > -1) {
                    return;
                }
                // currently only placing child control into first column.
                // todo: make it user option
                columns.unshift({
                    className: 'child-control ' + showChildIcon,
                    orderable: false,
                    data: null,
                    defaultContent: ''
                });
            }

            function _headerCallback(thead, data, start, end, display) {
                var customHeaders = (0, _jquery2.default)(thead).find('th.custom-header');

                customHeaders.each(function (idx, th) {
                    Object.keys(columnsMap).some(function (col) {
                        if (columnsMap[col].title === th.textContent) {
                            th.innerHTML = columnsMap[col].header;
                            return true;
                        }
                        return false;
                    });
                });
            }

            function _createdRow(row, data, index) {
                var templateCols = (0, _jquery2.default)(row).find('td.ko-template'),
                    rowContext = bindingContext.createChildContext(data, 'initialRow'),
                    rowMap = _lodash2.default.clone(data);
                rowContext.api = table;
                rowContext.row = rowMap;

                function setupTemplateCols() {
                    templateCols.each(function (idx, col) {
                        var value = table.row(index).column(col).data()[index],
                            // table.column(col).data()[0],
                        colName = table.column(col).dataSrc(),
                            column = columnsMap[colName],
                            colContext = {
                            value: _knockout2.default.observable(value),
                            column: column
                        },
                            cellContext = rowContext.createChildContext(colContext, 'cell');
                        rowMap[colName] = colContext.value;
                        _knockout2.default.renderTemplate(column.template, cellContext, {}, col);
                    });
                }

                if (templateCols.length) {
                    if (!table) {
                        // table is undefined if it is re-rendered with rows...
                        setTimeout(setupTemplateCols);
                    } else {
                        setupTemplateCols();
                    }
                }
            }
        }

        function setupData() {
            subs.push(rows.subscribe(function (rowChanges) {
                var addedRows = [];
                var isDelete = true;
                rowChanges.forEach(function (row) {
                    if (row.status !== 'deleted') {
                        isDelete = false;
                    }
                    if (row.status === 'added') {
                        addedRows.push(row.value);
                    }
                });

                table.rows.add(addedRows);
                if (isDelete) {
                    /* for serverside search, clear current row array
                    before pushing the returned results */
                    table.clear();
                }
                table.draw();
                if (hasChildren) {
                    setupChildListener();
                }
            }, null, 'arrayChange'));
        }

        function setupGrid() {
            settings.data = _knockout2.default.unwrap(settings.rows);
            if (settings.infiniteScroll) {
                if (settings.scrollElement) {
                    scrollElm = (0, _jquery2.default)(settings.scrollElement)[0];
                    scrollElm.addEventListener('scroll', scrollListener);
                } else {
                    window.addEventListener('scroll', scrollListener);
                }
            }
            if (hasChildren) {
                settings.initComplete = setupChildListener;
            }
            table = (0, _jquery2.default)(element).DataTable(settings);
        }

        function setupSearch() {
            var search = settings.clientSearch;
            if (search) {
                var basicSearch = search.basicSearch,
                    advancedSearch = search.advancedSearch;
                if (basicSearch) {
                    basicSearch.subscribe(function (query) {
                        table.search(query, false, true, search.caseInsen());
                    });
                }
                if (advancedSearch) {
                    advancedSearch.subscribe(function (filters) {
                        Object.keys(filters).forEach(function (key) {
                            var searchVal = filters[key].value || filters[key];
                            if (searchVal) {
                                table.column(key + ':name').search(searchVal, false, true, search.caseInsen());
                            }
                        });
                        // for empty filter object, clear all searches
                        if (Object.keys(filters).length === 0) {
                            table.columns().search('');
                        }
                        table.draw();
                    });
                }
            }
        }

        function setupSelection() {
            var select = settings.select;
            if (select && select.selectedItem) {
                table.on('select', function (e, dt, type, index) {
                    var i = index[0].column,

                    // todo: Is there a better way to get the column info?
                    column = table.row(index[0].row).settings()[0].aoColumns[i];

                    if (column.preventSelection) {
                        return;
                    }

                    if (type === 'cell') {
                        if (!hasChildren) {
                            select.selectedItem(table.row(index[0].row).data());
                            // if grid has children, ignore clicks on first column
                            // since that toggles child row
                        } else if (!(index[0].column === 0)) {
                            select.selectedItem(table.row(index[0].row).data());
                        }
                    }
                });
            }
        }

        function setupSorting() {
            // TODO: refactor clientsearch vs serverside approach
            if (!settings.clientSearch) {
                var th = (0, _jquery2.default)(table.header()[0]).find('th');
                th.each(function (i, cell) {
                    cell.className = cell.className.replace('sorting_disabled', '');
                    if (columns[i].sort) {
                        if (columns[i].sort.toLowerCase() === 'asc') {
                            cell.className = cell.className + ' ' + sortAscClass;
                        } else {
                            cell.className = cell.className + ' ' + sortDescClass;
                        }
                    }
                    if (columns[i].orderable || columns[i].orderable !== false) {
                        (0, _jquery2.default)(cell).click(function () {
                            if (cell.className.indexOf(sortAscClass) > -1) {
                                th.removeClass(sortAscClass);
                                cell.className = cell.className + ' ' + sortDescClass;
                                sort({}); // update for multicol sort
                                sort()[columns[i].data] = -1;
                            } else {
                                // clear classes from all other cells
                                th.removeClass(sortDescClass + ' ' + sortAscClass);
                                cell.className = cell.className + ' ' + sortAscClass;
                                sort({}); // update for multicol sort
                                sort()[columns[i].data] = 1;
                            }
                        });
                    }
                });
            }
        }

        function setupChildListener() {
            var clickElement = void 0;
            if (hasChildren.onRowSelect) {
                clickElement = (0, _jquery2.default)('table.dataTable td');
            } else {
                clickElement = (0, _jquery2.default)('table.dataTable td.child-control');
            }
            clickElement.on('click', function (event) {
                var td = (0, _jquery2.default)(event.currentTarget),
                    tr = td.closest('tr'),
                    row = table.row(tr),
                    context = {};
                var div = void 0,
                    rowContext = void 0;
                // move outside of click?
                if (hasChildren.template) {
                    div = tr[0].appendChild(document.createElement('div'));
                    // todo: does this need to be observable?
                    context.data = row.data();
                    context.element = tr[0];
                    rowContext = bindingContext.createChildContext(context, 'initialRow');
                    div.setAttribute('class', 'child-container');
                }

                if (row.child.isShown()) {
                    row.child.hide();
                    // todo: after adding user option to select which col position for icon,
                    // toggle icon based on position here, too
                    if (td.hasClass(hideChildIcon)) {
                        td.removeClass(hideChildIcon).addClass(showChildIcon);
                    }
                    tr.removeClass('show-child');
                } else {
                    if (hasChildren.accordion) {
                        table.rows()[0].forEach(function (idx) {
                            var expandedRow = table.row(idx);
                            if (expandedRow.child.isShown()) {
                                expandedRow.child.hide();
                                // if (td.hasClass(hideChildIcon)) {
                                //     td.removeClass(hideChildIcon).addClass(showChildIcon);
                                // }
                                expandedRow.node().className = expandedRow.node().className.replace(/show-child/, '');
                            }
                        });
                    }
                    if (hasChildren.template) {
                        row.child(div).show();
                        _knockout2.default.applyBindingsToNode(div, {
                            template: hasChildren.template
                        }, rowContext);
                    } else {
                        // todo: update default child view
                        row.child(_showChild(row.data())).show();
                    }
                    if (td.hasClass(showChildIcon)) {
                        td.removeClass(showChildIcon).addClass(hideChildIcon);
                    }
                    tr.addClass('show-child');
                }
            });

            function _showChild(data) {
                var html = '<div>';
                var hiddenChildren = Object.keys(columnsMap).map(function (col) {
                    if (columnsMap[col].visible === false) {
                        return columnsMap[col];
                    }
                    return '';
                }).filter(Boolean);

                hiddenChildren.forEach(function (child) {
                    html += '<span style="display:inline-block"><div>' + child.title + '</div>\n                            <div>' + data[child.data] + '</div></span>';
                });
                html += '</div>';
                return html;
            }
        }

        function setupResponsive() {
            if (settings.responsive) {
                table.on('responsive-resize', function (e, datatable, cols) {
                    var count = cols.reduce(function (a, b) {
                        return b === false ? a + 1 : a;
                    }, 0);
                    console.log(count + ' column(s) are hidden');
                    table.columns.adjust().epResponsive.recalc();

                    // temporarily manually updated width of tables to force
                    // tds to fit within visible space
                    datatable.nodes()[0].style.width = window.innerWidth - 50 + 'px';
                });
            }
        }

        setupColumns();
        setupGrid();
        setupData();
        setupSearch();
        setupSelection();
        setupSorting();
        setupResponsive();

        _knockout2.default.utils.domNodeDisposal.addDisposeCallback(element, function () {
            // possible fix for header not disposing?
            table.fixedHeader && table.fixedHeader.disable();
            if (settings.infiniteScroll) {
                if (scrollElm) {
                    scrollElm.removeEventListener('scroll', scrollListener, false);
                } else {
                    window.removeEventListener('scroll', scrollListener, false);
                }
            }
            subs.forEach(function (sub) {
                sub.dispose();
            });
        });
    }
};
//# sourceMappingURL=dataTables.js.map