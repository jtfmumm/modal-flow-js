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
