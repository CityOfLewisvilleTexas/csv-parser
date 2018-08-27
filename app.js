"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        csvFile: null,
        fileAsArray: [],
        detailsVisible: false
    },

    // start here
    mounted: function() {},

    // functions
    methods: {

        pickFile: function() {
            this.$refs.myFiles.click()
        },

        // grab file to use
        handleFiles: function() {
            if (window.FileReader) {
                this.getAsText(this.$refs.myFiles.files[0])
            } else {
                alert('FileReader is not supported in this browser.')
            }
        },

        // read file as text
        getAsText: function(file) {
            var reader = new FileReader()
            reader.readAsText(file)
            reader.onload = this.loadHandler // reader loader
            reader.onerror = this.errorHandler // reader error
        },

        // load file for parsing
        loadHandler: function(event) {
            var csv = event.target.result
            this.processData(csv)
        },

        // parse file
        processData: function(csv) {
            var allTextLines = csv.split(/\r\n|\n/);
            var lines = []
            for (var i = 0; i < allTextLines.length; i++) {
                var data = allTextLines[i].split(';')
                var tarr = [];
                for (var j = 0; j < data.length; j++) {
                    tarr.push(data[j])
                }
                lines.push(tarr[0].split(','))
            }
            this.fileAsArray = lines
        },

        // alert any errors
        errorHandler: function(evt) {
            if (evt.target.error.name == "NotReadableError") {
                alert('Error reading file!')
            }
        }
    }
})