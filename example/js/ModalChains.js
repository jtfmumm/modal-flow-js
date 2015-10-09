
DataPassingModal1 = ModalFlow.buildModalWith({
    initialize: function(options) {
        console.log("Initializing step 1...");
    },
    clickthroughDataUpdater: function() {
        var data = {};
        data.step1 = $("#step-1-input").val();
        $("#step-1-input").val("");
        return data;
    },
    $modal: $("#modal-step-1"),
    beforeSubmit: function() {
        console.log("About to submit step 1...");
    },
    $clickthroughLink: $("#modal-step-1-clickthrough")
});

DataPassingModal2 = ModalFlow.buildModalWith({
    initialize: function(options) {
        console.log("Initializing step 2...");
        $("#step-2-last").html("Last value: " + options.step1)
    },
    clickthroughDataUpdater: function(data) {
        data.step2 = $("#step-2-input").val();
        $("#step-2-input").val("");
        return data;
    },
    $modal: $("#modal-step-2"),
    beforeSubmit: function() {
        console.log("About to submit step 2...");
    },
    $clickthroughLink: $("#modal-step-2-clickthrough")
});

var dataPassingModalExit = function(data) {
    console.log("Words: ");
    console.log("Step 1: " + data.step1);
    console.log("Step 2: " + data.step2);
    closeModal();
};

function closeModal() {
    $("[data-js=close-modal]").click();
}

var dataPassingModalChain = ModalFlow.chain(DataPassingModal1, DataPassingModal2, dataPassingModalExit);

$("#data-passing-chain-button").click(function() { dataPassingModalChain.load() });
