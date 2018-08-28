"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        filename: '',
        fileAsArray: [],
        detailsVisible: true,
        filetype: '',
        headers: []
    },

    // functions
    methods: {

        pickFile: function() {
            this.$refs.myFiles.click()
        },

        handleFiles: function() {
            if (window.FileReader) {
                this.filename = this.$refs.myFiles.value.split('\\')[this.$refs.myFiles.value.split('\\').length - 1]
                this.fileAsArray = []
                if (this.filename.slice(-3) == 'csv') {
                    this.filetype = 'csv'
                    this.csvToJson()
                }
                else if (this.filename.slice(-4) == 'xlsx') {
                    this.filetype = 'xlsx'
                    this.excelToJson(this.$refs.myFiles.files[0])
                }
            } else {
                alert('FileReader is not supported in this browser.')
            }
        },

        // grab file to use
        csvToJson: function() {
            this.getAsText(this.$refs.myFiles.files[0])
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
        },

        reset: function() {
            this.filename = ''
            this.fileAsArray = []
            this.headers = []
            this.filetype = ''
            document.querySelector('#csvFileInput').value = ''
        },

        // xlsx file to json
        excelToJson: function(file) {
            var reader = new FileReader();

            reader.onload = function(e) {
                var data = e.target.result
                var workbook = XLSX.read(data, {
                    type: 'binary'
                })
                workbook.SheetNames.forEach(function(sheetName) {

                    // worksheet
                    var ws = workbook.Sheets[sheetName]

                    // Here is your object
                    var XL_row_object = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
                    this.fileAsArray = XL_row_object
                    for (var prop in this.fileAsArray[0]) {
                        if (this.fileAsArray[0].hasOwnProperty(prop)) {
                            this.headers.push({
                                text: prop,
                                value: prop
                            })
                        }
                    }
                }.bind(this))
            }.bind(this)

            reader.onerror = function(ex) {
                console.log(ex);
            };

            reader.readAsBinaryString(file);
        }
    }
})