//     ModalFlow.js 0.0.1

//     (c) 2015 TheLadders
//     ModalFlow may be freely distributed under the MIT license.

var $ = require("jquery");


//BUILD MODAL
/*
Options that can be passed into Modal.buildWith().

     initialize: An optional function for setting up local modal data and
        event listeners other than submit (e.g. for clicking cancel).

     errorProcessor: Optional error handling object that requires two methods:
        .handleErrors(): handles ajax errors,
        .clearValidationErrors(): clears validation errors from modal before
            submit

     beforeSubmit: An optional function that is called when submit button is
        clicked, but before submission

     ajaxParameters:
         type: ajax type (required)
         url: ajax url (required)
         data: Optional function for sending data to server with request.
            Use a function like
                function() { return $form.serialize(); },
         responseMixin: Optional function for mixing data into ajax response.
            Use a function like
                function() { return {cost: 100} },
         error: error handler
         success: function called on success (this would typically be used for
            side effects between modals, such as a spinner)

     $modal: jQuery object (required),

     $form: jQuery object for when modal uses a form,

     $clickthroughLink: jQuery object for link when modal does not use a form
*/


function Modal(options) {
    this.$modal = options.$modal;
    this.$form = options.$form || null;
    this.$clickthroughLink = options.$clickthroughLink || null;
    this.open = function() { this.$modal.foundation("reveal", "open"); };
    this.initialize = options.initialize || null;
    this.beforeSubmit = options.beforeSubmit || null;
    this.errorProcessor = options.errorProcessor || null;

    if (options.ajaxParameters) {
        this.submit = this.configureAjax(options.ajaxParameters);
    } else {
        this.submit = function() {
            this.resolvePromise(this.input);
        }
    }

    var submitListener = function(e) {
        e.preventDefault();
        if (this.errorProcessor) this.errorProcessor.clearValidationErrors();
        if (this.beforeSubmit) this.beforeSubmit();
        this.submit();
    }.bind(this);

    if (this.$form) {
        this.setUpSubmitListener = function() {
            this.$form.unbind("submit");
            this.$form.submit(submitListener);
        };
    } else {
        this.setUpSubmitListener = function() {
            //Modals that don't use a form should provide
            //a clickthrough link instead
            this.$clickthroughLink.click(submitListener);
        };
    }

}

Modal.prototype = {
    input: null,
    load: function() {
        return this.loadWith();
    },
    loadWith: function(data) {
        this.input = data;
        if (this.initialize) this.initialize(this.input);
        this.$deferred = $.Deferred();
        this.setUpSubmitListener();
        this.open();

        return this.$deferred.promise();
    },
    resolvePromise: function(data) {
        this.$modal.hide();
        this.$deferred.resolve(data);
    },
    configureAjax: function(params) {
        return function() {
            var responseMixin = params.responseMixin ? params.responseMixin : function() {};
            $.ajax({
                type: params.type,
                url: params.url,
                data: params.data.call(this),
                success: function(data) {
                    var responseMixinData = responseMixin.call(this);
                    for (var prop in responseMixinData) {
                        data[prop] = responseMixinData[prop];
                    }
                    this.resolvePromise(data);
                    if (params.success) params.success();
                }.bind(this),
                error: params.error || this.errorProcessor.handleErrors
            });
        };
    }
};

function buildWith(options) {
    return new Modal(options);
}


//BUILD MODAL WORKFLOWS
/*
    You can create a linked series of modals by using the chain method:
        var series = Modal.chain(Modal1, Modal2, Modal3, Modal4);
        series.load();

    .chain() returns a Transition object.  Call load() or loadWith() on this
    object to open Modal1 and begin the series.  Submitting Modal1 will
    load Modal2 with Modal1's response data.  And so on with the others in
    sequence.  You can optionally provide an exit function as the last
    in the series.

    If you need to branch based on the response data at some point in
    the series, you can use the .link(), .linkBranches(), and .linkExit()
    methods instead.  For example:

        var exitForHighIncome = Modal.linkExit(HighModal, highExit);
        var exitForLowIncome = Modal.linkExit(LowModal, lowExit);
        var branchFromSecond = Modal.linkBranches(SecondModal, chooseHighOrLow);
        var startSeries = Modal.link(EntryModal, branchFromSecond);

        var chooseHighOrLow = function(data) {
            if (data.salary > 99999) {
                return exitForHighIncome.load();
            } else {
                return exitForLowIncome.load();
            }
        }
        startSeries.load();

    This creates the following branching series:
                                                     ->HighModal -> highExit
                                                   Y/
        EntryModal -> SecondModal -> (high salary?)
                                                   N\
                                                     ->LowModal -> lowExit

    Note: the links are declared in reverse order because of the
    need to define later links before referencing them in earlier links.
 */

function Transition(lastModal, nextStep) {
    this.lastModal = lastModal;
    //nextStep() is either a function that takes a response,
    //calls loadWith(response) on a Modal or Transition and
    //returns the result,
    // or an exit function that exits the workflow
    this.nextStep = nextStep;
}
Transition.prototype = {
    load: function() { this.loadWith(); },
    loadWith: function(data) {
        var _this = this;
        this.lastModal.loadWith(data).done(function(response) {
            return _this.nextStep(response);
        });
    }
};


//For building a workflow that has no branches.
//Takes as many arguments as there are steps in the workflow.
//The last argument can be an exit function, a Modal, or a Transition.
function chain() {
    if (arguments.length < 2) throw new Error("Modal: chain requires more than one argument");
    var steps = [].slice.call(arguments);
    var from;

    var nextLink = steps.pop();
    //Check to see if the chain terminates in an exit function
    if (typeof nextLink === "function") {
        from = steps.pop();
        nextLink = linkExit(from, nextLink);
    }

    //Build the links, starting from the end of the array
    while (steps.length > 0) {
        from = steps.pop();
        nextLink = link(from, nextLink);
    }

    //Returns the first link in the workflow so that
    //load() or loadWith(data) can be called on it
    return nextLink;
}


function link(lastModal, nextModalOrTransition) {
    var nextStep = function(response) {
        return nextModalOrTransition.loadWith(response);
    };
    return new Transition(lastModal, nextStep);
}

//For modals that lead to different branches
//depending on some condition.
//The branching function should return a loaded modal or link
//  e.g. return ModalLink1.load();
function linkBranches(lastModal, branchingFunction) {
    return new Transition(lastModal, branchingFunction);
}

//For linking to a function that exits the modal workflow
function linkExit(lastModal, exitFunction) {
    return new Transition(lastModal, exitFunction);
}


module.exports = {
    buildWith: buildWith,
    link: link,
    linkBranches: linkBranches,
    linkExit: linkExit,
    chain: chain
};

