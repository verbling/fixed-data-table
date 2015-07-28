/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableTransition.react
 */

 /**
  * TRANSITION SHIM
  * This acts to provide an intermediate mapping from the old API to the new API.
  *
  * Remove this entire file and replace the two lines in FixedDataTableRoot when ready
  * to continue to the new API.
  */

'use strict';

var React = require('React');
var ReactChildren = React.Children;

var invariant = require('invariant');

var PropTypes = React.PropTypes;

// Current Table API
var Table = require('FixedDataTable.react');
var CellDefault = require('FixedDataTableCellDefault.react');
var Column = require('FixedDataTableColumn.react');
var ColumnGroup = require('FixedDataTableColumnGroup.react');

var NextVersion = '6.0.0';
var DocumentationUrl = 'http://facebook.github.io/fixed-data-table'

/**
 * Notify in console that some prop has been deprecated.
 */
function notifyDeprecated(prop, reason){
  if (__DEV__){
    console.warn(
      prop + ' will be DEPRECATED in versions ' + NextVersion + ' and beyond. \n' +
      reason + '\n' +
      'Read the docs at: ' + DocumentationUrl
    )
  }
}

var TransitionColumn = React.createClass({
  statics: {
    __TableColumn__: true
  },

  render() {
    if (__DEV__) {
      throw new Error(
        'Component <TransitionColumn /> should never render'
      );
    }
    return null;
  }
});

var TransitionColumnGroup = React.createClass({
  statics: {
    __TableColumnGroup__: true
  },

  render() {
    if (__DEV__) {
      throw new Error(
        'Component <TransitionColumnGroup /> should never render'
      );
    }
    return null;
  }
});

var TransitionCell = React.createClass({
  propTypes: {
    rowGetter: PropTypes.func.isRequired,
    dataKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    cellRenderer: PropTypes.func,
    cellDataGetter: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
  },

  _getRowData() {
    return this.props.rowGetter(this.props.rowIndex);
  },

  _getData() {
    var dataKey = this.props.dataKey;
    var rowData = this._getRowData();
    if (this.props.cellDataGetter){
      return this.props.cellDataGetter(dataKey, rowData);
    }

    return rowData[dataKey];
  },

  render() {
    if (this.props.cellRenderer){
      return (
        <CellDefault
          {...this.props} >
          {this.props.cellRenderer(
            this._getData(),
            this.props.dataKey,
            this._getRowData(),
            this.props.rowIndex,
            {},
            this.props.width
          )}
        </CellDefault>
        )
    } else {
      return (
        <CellDefault
          {...this.props} >
          {this._getData()}
        </CellDefault>
      )
    }
  }
});

var TransitionHeader = React.createClass({
  propTypes: {
    label: PropTypes.string
  },

  render() {
    return (
      <CellDefault
        {...this.props} >
        {this.props.label}
      </CellDefault>
    )
  }
});

/**
 * Transition Table takes in the table and maps it to the new api.
 *
 * Creates warnings for API endpoints that are deprecated.
 */
var TransitionTable = React.createClass({
  propTypes: {
    /**
     * DEPRECATED
     * rowGetter(index) to feed data into each cell.
     */
    rowGetter: PropTypes.func
  },

  getInitialState() {
    // Throw warnings on deprecated props.
    var state = {}
    var needsMigration = this._checkDeprecations();
    state.columns = this._convertColumns(needsMigration);
    return state;
  },

  _checkDeprecations() {
    var needsMigration = false;

    if (this.props.rowGetter){
      notifyDeprecated('rowGetter', 'Please use the cell API in Column to fetch data ' +
        'for your cells.');

      // This needs a migration.
      needsMigration = true;
    }

    this.props.children.forEach((child) => {

    })

    return needsMigration;
  },

  _convertColumns(needsMigration) {
    var rowGetter = this.props.rowGetter;

    // If we don't need to migrate, then
    if (!needsMigration){
      return this.props.children.map((child, i) => {
        // Convert them directly
        if (child.type.__TableColumn__){
          return <Column {...child.props} />
        }

        if (child.type.__TableColumnGroup__){
          return <ColumnGroup {...child.props} />
        }
      });
    }

    // Do some conversions
    return this.props.children.map((child, i) => {

      // Constuct the cell to be used using the rowGetter
      return (
        <Column
          key={'columns_' + i}
          header={
            <TransitionHeader
              label={child.props.label}
            />
          }
          cell={
            <TransitionCell
              dataKey={child.props.dataKey}
              className={child.props.cellClassName}
              rowGetter={this.props.rowGetter}
              cellDataGetter={child.props.cellDataGetter}
              cellRenderer={child.props.cellRenderer}
            />
          }
          footer={
            null
          }
          {...child.props}
        />
      )
    })
  },

  render() {
    return (
      <Table
        {...this.props}>
        {this.state.columns}
      </Table>
    )
  },
});

var TransitionRoot = {
  Cell: CellDefault, // NEW API, just use the cell that's provided :)
  Column: TransitionColumn,
  ColumnGroup: TransitionColumnGroup,
  Table: TransitionTable,
};

module.exports = TransitionRoot;