"use strict";

// Vue!
var app = new Vue({
    el: "#app",

    // vars
    data: {
        stepper: 1,
        configs: [],


        columns: [],
        masks: [],
        mask: '',
        hasColumnMapping: false,
        columnMap: {},

        isLoading: {
            configs: false,
            masks: false,
            columns: false
        },
        selected: {
            table: '',
            config: -1
        },
        done: false,
        title: '',
        description: ''
    },

    computed: {
        // checks if provided mask is unique
        isUniqueMask: function() {
            if (this.mask==='') return false
            return this.masks.indexOf(this.mask) == -1
        },

        // column mapping object
        columnMapFormatted: function() {
            if (this.hasColumnMapping===false) return ''
            else {
                return this.columns.map(function(col) {
                    return col + '==>' + this.columnMap[col]
                }.bind(this)).join('|||')
            }
        },

        // configs formatted for <select>
        configsFormatted: function() {
            return this.configs.map(function(cf, idx) {
                return {
                    text: cf.title + ' - [' + cf.tablemask + ']',
                    value: idx
                }
            })
        }
    },

    watch: {
        stepper: function() {
            if (this.stepper === 2) this.fetchMasks()
            else if (this.stepper === 3) this.fetchColumns()
        }
    },

    // start here
    mounted: function() {
        this.fetchConfigs()
        this.fetchColumns()
    },

    // functions
    methods: {

        reset: function() {
            this.stepper = 1,
            this.configs = [],
            this.columns = [],
            this.masks = [],
            this.mask = '',
            this.hasColumnMapping = false,
            this.columnMap = {},
            this.isLoading = {
                configs: false,
                masks: false,
                columns: false
            }
            this.selected = {
                config: -1,
                table: ''
            }
            this.done = false
            this.title = ''
            this.description = ''
            Vue.nextTick(this.fetchConfigs)
        },

        // fetch all tables in [CSVUploadApp]
        fetchConfigs: function() {
            if (this.isLoading.configs===false) {
                this.isLoading.configs = true
                axios.post('https://ax1vnode1.cityoflewisville.com/v2?webservice=Spreadsheet Uploader/Get All Uploader Configs', {
                    auth_token: localStorage.colAuthToken
                }).then(this.handleConfigs)
            }
        },
        handleConfigs: function(res) {
            this.configs = res.data[0]
            this.isLoading.configs = false
        },

        setDetails: function() {

            var cf = this.configs[this.selected.config]
            this.title = cf.title
            this.description = cf.description
            this.selected.table = cf.tablename
            Vue.nextTick(this.fetchColumns)
            if (cf.columnmaps.length>0) {
                this.hasColumnMapping = true
                cf.columnmaps.split('|||').forEach(function(map) {
                    var a = map.split('==>')[0]
                    var b = map.split('==>')[1]
                    Vue.set(this.columnMap, a, b)
                }.bind(this))
            }
        },

        // fetch all columns in selected table
        fetchColumns: function() {
            if (this.isLoading.columns===false && this.selected.table!='') {
                this.isLoading.columns = true

                // axios('fetch tables')
                axios.post('https://ax1vnode1.cityoflewisville.com/v2?webservice=Spreadsheet Uploader/Get Columns By Table Name', {
                    auth_token: localStorage.colAuthToken,
                    tablename: this.selected.table
                }).then(this.handleColumns)
            }
        },
        handleColumns: function(res) {
            this.columns = res.data[0].map(function(col) { return col.COLUMN_NAME })
            this.isLoading.columns = false
        },

        // fetch all masks
        fetchMasks: function() {
            if (this.isLoading.masks===false) {
                this.isLoading.masks = true

                // axios('fetch masks')
                axios.post('https:/ax1vnode1.cityoflewisville.com/v2?webservice=Spreadsheet Uploader/Get All Masks', {
                    auth_token: localStorage.colAuthToken
                }).then(this.handleMasks)
            }
        },
        handleMasks: function(res) {
            this.masks = res.data[0].map(function(m) { return m.tablemask })
            this.isLoading.masks = false
        },

        // generates random string
        generateRandomMask: function() {
            var text = ""
            var possible = "abcdefghijklmnopqrstuvwxyz"
            for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
            return text;
        },

        // randomize mask
        fillWithRandomMask: function(context) {
            this.mask = this.generateRandomMask()
            while(!this.isUniqueMask) this[context] = this.generateRandomMask()
        },

        submit: function() {
            console.log({
                auth_token: localStorage.colAuthToken,
                title: this.title,
                description: this.description,
                tablename: this.selected.table,
                tablemask: this.mask,
                columnmaps: this.columnMapFormatted
            })

            // axios.post('https://ax1vnode1.cityoflewisville.com/v2?webservice=Spreadsheet Uploader/Insert Uploader Config', {
            //     auth_token: localStorage.colAuthToken,
            //     title: this.title,
            //     description: this.description,
            //     tablename: this.selected.table,
            //     tablemask: this.mask,
            //     columnmaps: this.columnMapFormatted
            // }).then(this.handleMasks)
        },

        openUploader: function(mask) {
            window.open('../?mask=' + mask)
        },

        relocate: function(url) {
            location.href = url
        }
    }
})