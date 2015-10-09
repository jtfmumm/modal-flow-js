# ModalFlow.js
A small JS library for modal workflows

## Installation

ModalFlow works with AMD, CommonJS-style, or html import in a script tag. 

ModalFlow.js depends on jQuery. The current version uses Foundation reveal for modal display.

An example project is available at /example/index.html. This project currently only shows a 
data passing modal flow without ajax calls (everything in the example is client-side).

## Usage

To create a modal, use 

```
var myModal = Modal.buildWith({ /* configuration parameters */ })
```

Pass in configuration parameters as outlined in the Modal Build Parameters section below.

If there is no branching logic in your modal workflow, you can chain a series of modals together using:

```
var chain = Modal.chain(Modal1, Modal2, Modal3, Modal4); // for however many modals you have
chain.load(); // To open the first modal
```

You can think of your modal chain as a kind of data transformation pipeline. Each modal passes output along to the next
modal's input. This output can include user UI input as well as response data from an ajax request associated with the 
modal. The modal chain can end with an exit function which takes the output of the last modal as its argument.

If you need branching, you can use a series of links. Because of hoisting, these links need to be declared in reverse order.
For example:

```
// Our modals 
var EntryModal = Modal.buildWith({ /* configuration parameters */ })
var SecondModal = Modal.buildWith({ /* configuration parameters */ })
var ThirdModal = Modal.buildWith({ /* configuration parameters */ })
var LowModal = Modal.buildWith({ /* configuration parameters */ })
var HighModal = Modal.buildWith({ /* configuration parameters */ })

// Some exit functions
var lowExit = function(data) { /* do something with data when exiting workflow */ }
var highExit = function(data) { /* do something with data when exiting workflow */ }

// Setting up the links (declared in reverse order because of variable hoisting)
var exitForHighIncome = Modal.linkExit(HighModal, highExit);
var exitForLowIncome = Modal.linkExit(LowModal, lowExit);

var chooseHighOrLow = function(data) {
    if (data.salary > 99999) {
          return exitForHighIncome.load();
    } else {
          return exitForLowIncome.load();
    }
}

var branchFromThird = Modal.linkBranches(ThirdModal, chooseHighOrLow);
var secondToThird = Modal.linkBranches(SecondModal, branchFromThird);
var workflowStart = Modal.link(EntryModal, branchFromSecond);

// Initialize and open the first modal, EntryModal
workflowStart.load(); 
```

This creates the following branching series:  
```
                                                              ->HighModal -> highExit  
                                                            Y/  
    EntryModal -> SecondModal -> ThirdModal -> (high salary?)  
                                                            N\  
                                                              ->LowModal -> lowExit  
```

## Modal Build Parameters

Options that can be passed into Modal.buildWith():

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
