"use strict";
var TO_BE_OVERRIDDEN = '[FlogoInstallerBaseComponent] To be overridden.';
var FlogoInstallerBaseComponent = (function () {
    function FlogoInstallerBaseComponent() {
        this._categories = [];
        this._installables = [];
        this.installables = [];
    }
    FlogoInstallerBaseComponent.prototype.init = function () {
        console.log('Initialise Flogo Installer Base Component.');
        this.updateData();
    };
    FlogoInstallerBaseComponent.prototype.updateData = function () {
        var _this = this;
        return Promise.all([
            this.getCategories(),
            this.getInstallables()
        ])
            .then(function (result) {
            _this._categories = result[0] || [];
            _this.installables = result[1] || [];
        })
            .then(function () {
            _this._installables = _this.getFilteredInstallables();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    FlogoInstallerBaseComponent.prototype.getCategories = function () {
        console.log(TO_BE_OVERRIDDEN);
        return Promise.resolve([
            'Requests',
            'Optimizations',
            'Connect to Devices',
            'Framework Adaptors',
            'Web Adaptors',
            'Uncategorized'
        ]);
    };
    FlogoInstallerBaseComponent.prototype.getInstallables = function () {
        console.log(TO_BE_OVERRIDDEN);
        return Promise.resolve([
            {
                name: '',
                description: '',
                version: '',
                where: '',
                icon: '',
                author: '',
                createTime: Date.now(),
                isInstalled: false
            }
        ]);
    };
    FlogoInstallerBaseComponent.prototype.getFilteredInstallables = function () {
        var reg = new RegExp(this.query, 'i');
        return this.installables.filter(function (installable) {
            var displayName = installable.title || installable.name;
            return displayName.search(reg) != -1 || installable.description.search(reg) != -1;
        });
    };
    FlogoInstallerBaseComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'query')) {
            var currentValue = changes['query'].currentValue;
            this.onQueryChange(currentValue);
        }
        if (_.has(changes, 'status')) {
            this.onInstallerStatusChange(changes['status'].currentValue);
        }
    };
    FlogoInstallerBaseComponent.prototype.onQueryChange = function (query) {
        this._installables = this.getFilteredInstallables();
    };
    FlogoInstallerBaseComponent.prototype.onCategorySelected = function (categoryName) {
        console.log(TO_BE_OVERRIDDEN);
        console.log(categoryName);
    };
    FlogoInstallerBaseComponent.prototype.onItemAction = function (info) {
        console.log(TO_BE_OVERRIDDEN);
    };
    FlogoInstallerBaseComponent.prototype.onInstallerStatusChange = function (status) {
        console.log(TO_BE_OVERRIDDEN);
        console.log(status);
    };
    return FlogoInstallerBaseComponent;
}());
exports.FlogoInstallerBaseComponent = FlogoInstallerBaseComponent;
