# ModalFlow.js
A small JS library for modal workflows

## Installation

ModalFlow.js depends on jQuery.

## Usage

To create a modal, use Modal.buildWith(), passing in configuration parameters as outlined in Modal Build Parameters below.

If there is no branching logic in your modal workflow, you can chain a series of modals together using

```
var chain = Modal.chain(Modal1, Modal2, Modal3, Modal4); // for however many modals you have
chain.load(); // To open the first modal
```

You can think of your modal chain as a kind of data transformation pipeline. Each modal passes output along to the next
modal's input. This output can include user UI input as well as response data from an ajax request associated with the 
modal. The modal chain can end with an exit function which takes the output of the last modal as its argument.

If you need branching, you can use a series of links. Because of hoisting, these need to be declared in reverse order.
For example:

```
// Our modals 
var EntryModal = Modal.buildWith({ ... })
var SecondModal = Modal.buildWith({ ... })
var LowModal = Modal.buildWith({ ... })
var HighModal = Modal.buildWith({ ... })

// A branching function 
var chooseHighOrLow = function(data) {
    if (data.salary > 99999) {
          return exitForHighIncome.load();
    } else {
          return exitForLowIncome.load();
    }
}

// Setting up the links
var exitForHighIncome = Modal.linkExit(HighModal, highExit);
var exitForLowIncome = Modal.linkExit(LowModal, lowExit);
var branchFromSecond = Modal.linkBranches(SecondModal, chooseHighOrLow);
var workflowStart = Modal.link(EntryModal, branchFromSecond);

workflowStart.load(); // To open the first modal, EntryModal
```


## Modal Build Parameters

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

        var chooseHighOrLow = function(data) {
            if (data.salary > 99999) {
                return exitForHighIncome.load();
            } else {
                return exitForLowIncome.load();
            }
        }
        
        var exitForHighIncome = Modal.linkExit(HighModal, highExit);
        var exitForLowIncome = Modal.linkExit(LowModal, lowExit);
        var branchFromSecond = Modal.linkBranches(SecondModal, chooseHighOrLow);
        var startSeries = Modal.link(EntryModal, branchFromSecond);

        startSeries.load();

    This creates the following branching series:
                                                     ->HighModal -> highExit
                                                   Y/
        EntryModal -> SecondModal -> (high salary?)
                                                   N\
                                                     ->LowModal -> lowExit

    Note: the links are declared in reverse order because of the
    need to define later links before referencing them in earlier links.
