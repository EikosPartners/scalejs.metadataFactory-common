import ko from 'knockout';
import { merge } from 'scalejs';
import { receive } from 'scalejs.messageBus';

export default function validationsViewModel(node) {
    let unwrap = ko.unwrap,
        computed = ko.computed,
        subs = [],
        isInvalid,
        visibleMessages,
        showValidationMessages = ko.observable(true),
        context = this;

    subs.push(receive(context.id + '.validate', function (actionObj) {
        isInvalid = _validate(_.values(context.dictionary()));
        if (!isInvalid) {
            actionObj && actionObj.successCallback(actionObj.options);
        }
    }));

    visibleMessages = computed(function () {
        return aggregateVisibleMessages(_.values(context.dictionary()));
    }).extend({deferred: true});

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

    return merge(node, {
        visibleMessages,
        showValidationMessages,
        dispose: function () {
            subs.forEach(function (sub) {
                sub.dispose();
            })
        }
    });
};
