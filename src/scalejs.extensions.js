import mvvm from 'scalejs.mvvm';
import ko from 'knockout';
import 'scalejs.metadataFactory';
import 'scalejs.noticeboard';
import 'scalejs.expression-jsep';
import 'validationEngine';

window.ko = ko;
mvvm.init({ doNotRender: true });
