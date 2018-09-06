"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        stepper: 1,
        verifiedHeaders: [],
        processing: false,
        tablemask: null,
        uploaderConfig: null,

        filename: '',
        filesize: 0,
        fileAsArray: [],
        detailsVisible: true,
        filetype: '',
        headers: []
    },

    computed: {
        verifiedHeadersFormatted: function() {
            return this.verifiedHeaders.map(function(h) {
                return {
                    text: h,
                    value: h
                }
            })
        },

        fileAsArrayFormatted: function() {
            if (this.filetype == 'csv') {
                return this.fileAsArray.slice(1).map(function(row) {
                    var obj = {}
                    for (var prop in this.fileAsArray[0]) {
                        // verified only
                        if (this.verifiedHeaders.indexOf(this.fileAsArray[0][prop]) != -1)
                            obj[this.fileAsArray[0][prop]] = row[prop]
                    }
                    return obj
                }.bind(this))
            } else return this.fileAsArray.map(function(row) {
                var obj = {}
                for (var prop in this.fileAsArray[0]) {
                    // verified only
                    if (this.verifiedHeaders.indexOf(prop) != -1)
                        obj[prop] = row[prop]
                }
                return obj
            }.bind(this))
        }
    },

    mounted: function() {
        this.fetchConfig()
    },

    // functions
    methods: {

        fetchConfig: function() {
            this.tablemask = getUrlParameter('mask')
            if (this.tablemask===null || this.tablemask===undefined || this.tablemask==='') {
                alert('Invalid url parameter')
                return
            }
            else {
                axios.post('https://ax1vnode1.cityoflewisville.com/v2?webservice=Spreadsheet Uploader/Get Uploader Config by Mask', { tablemask: this.tablemask })
                    .then(this.handleConfig)
            }
        },
        handleConfig: function(res) {
            this.uploaderConfig = res.data[0][0]
        },

        fake: function() {
            this.filename = 'fake'
            this.filetype = 'xlsx'
            this.filesize = '1 KB'
            this.fileAsArray = [
                { fname: 'colton', lname: 'wood', email: 'cwood@col.com' },
                { fname: 'elizabeth', lname: 'mayes', email: 'emayes@col.com' },
                { fname: 'jason', lname: 'kirkland', email: 'jkirkland@col.com' }
            ]
            this.headers = [
                { text: 'fname', value: 'fname' },
                { text: 'lname', value: 'lname' },
                { text: 'email', value: 'email' }
            ]
            this.verifiedHeaders = this.headers.map(function(h) { return h.text })
            this.stepper = 2
        },

        pickFile: function() {
            this.$refs.myFiles.click()
        },

        updateFileName: function() {
            this.filename = this.$refs.myFiles.value.split('\\')[this.$refs.myFiles.value.split('\\').length - 1]
            var fsz = this.$refs.myFiles.files[0].size
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
            if (fsz == 0) this.filesize = '0 Bytes'
            else {
                var i = parseInt(Math.floor(Math.log(fsz) / Math.log(1024)))
                this.filesize = (fsz / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
            }


        },

        handleFiles: function() {
            if (window.FileReader) {
                this.fileAsArray = []
                this.processing = true
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
            this.headers = []
            this.verifiedHeaders = []
            for (var prop in this.fileAsArray[0]) {
                this.headers.push({
                    text: this.fileAsArray[0][prop],
                    value: this.fileAsArray[0][prop]
                })
            }
            this.verifiedHeaders = this.headers.map(function(h) { return h.value })
            this.processing = false
            this.stepper = 2
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
                    this.headers = []
                    this.verifiedHeaders = []
                    for (var prop in this.fileAsArray[0]) {
                        if (this.fileAsArray[0].hasOwnProperty(prop)) {
                            this.headers.push({
                                text: prop,
                                value: prop
                            })
                        }
                    }
                    this.verifiedHeaders = this.headers.map(function(h) { return h.value })
                    this.processing = false
                    this.stepper = 2
                }.bind(this))
            }.bind(this)

            reader.onerror = function(ex) {
                console.log(ex);
            };

            reader.readAsBinaryString(file);
        }
    }
})

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName, i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) return sParameterName[1] === undefined ? true : sParameterName[1];
    }

};