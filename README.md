# modal-flow-js
A small JS library for modal workflows

## Build Modal

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

## Build Modal Workflows

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
