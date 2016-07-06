'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = validationsViewModel;

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _scalejs = require('scalejs');

var _scalejs2 = require('scalejs.messageBus');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validationsViewModel(node) {
    var unwrap = _knockout2.default.unwrap,
        computed = _knockout2.default.computed,
        subs = [],
        isInvalid = void 0,
        visibleMessages = void 0,
        showValidationMessages = _knockout2.default.observable(true),
        context = this;

    subs.push((0, _scalejs2.receive)(context.parentContext.metadata[0].id + '.validate', function (actionObj) {
        isInvalid = _validate(_.values(context.dictionary()));
        if (!isInvalid) {
            actionObj && actionObj.successCallback(actionObj.options);
        }
    }));

    visibleMessages = computed(function () {
        return aggregateVisibleMessages(_.values(context.dictionary()));
    }).extend({ deferred: true });

    function aggregateVisibleMessages(childNodes) {
        return childNodes.reduce(function (msgs, childNode) {
            var msg;

            if (childNode.visibleMessage) {
                msg = childNode.visibleMessage();
                if (msg) {
                    msgs.push(msg);
                    return msgs;
                }
            }
            msgs = _.compact(msgs.concat(msg));
            return msgs;
        }, []);
    }

    function _validate(childNodes) {
        return childNodes.reduce(function (isInvalid, curr) {
            if (curr.validate && typeof curr.validate === 'function') {
                return curr.validate() || isInvalid;
            } else {
                return _validate(curr.mappedChildNodes || []) || isInvalid;
            }
        }, false);
    }

    return (0, _scalejs.merge)(node, {
        visibleMessages: visibleMessages,
        showValidationMessages: showValidationMessages,
        dispose: function dispose() {
            subs.forEach(function (sub) {
                sub.dispose();
            });
        }
    });
};
//# sourceMappingURL=validationsViewModel.js.map