jquery-plugins
==========

## What is this?

**jquery-plugins** are JavaScript plug-ins for jquery.

Each library is documented, and none are minified. If you want a minified version, please feel free to run the code through a minifier - I happen to like YUI Compressor. It is my intention to only commit un-minified versions to this repo so that all of the comments are intact and other engineers can easily see what I'm doing, how I'm doing it, and *most importantly*, why I'm doing it.

## Plug-ins in the collection

### *cjl-sortedtable*
Creates a sorted (and sortable) table directly from markup, enabling the developer to maintain their *progressive enhancement* practice. The sort order may be specified either in the markup, using a `data-sort` attribute on the table, or in the script call. The first column is set in the sort order by a click on the column header. Columns can be added to the sort order with a shift+click. Clicking a column already in the sort order toggles the sort order between ascending and descending.

#### Syntax:
*object* $(*selector*).sortedtable([*object[]* sortkeys])

##### Properties
- ***object* *instance*.body**: The table body
- ***integer* *instance*.colCount**: The count of columns in the table
- ***object[]* *instance*.cols**: Names of columns in the table, defaults to col_{index}
- ***object[]* *instance*.data**: Array of objects representing table rows
- ***string* *instance*.foot**: The table footer
- ***string* *instance*.head**: The table header
- ***node* *instance*.elem**: jQuery element reference to table

##### Methods
- ***object[]* *instance*.sorts**: Sort keys. Each object in the array contains 'name' and 'dir', which is 1 (ascending) or -1 (descending)
- ***void* *instance*.clearSort**: Clears the sort keys
- ***void* *instance*.getSortAttribute**: Sets the object array containing sort keys using the data-sort attribute of the table
- ***void* *instance*.setSortAttribute**: Sets the data-sort attribute on the table using the sort keys
- ***void* *instance*.sort([*object[]* sortOn[, *boolean* retain]])**: Sorts the data in the table body using the sort keys provided in the data-sort attribute of the table and the <em>sortOn</em> object array (each object in the array should contain a 'name' and 'dir' property, see `*instance*.sorts`), retaining the existing sort order if <em>retain</em> is specified.
- ***string* *instance*.toHtml([*boolean* bodyOnly])**: Returns the complete table, or the table body only (without header and footer), as a string.

##### Examples
- var airports = $('#airports').sortedtable({sortOn:[{name:'Country', dir:'ascending'}, {name:'City', dir:1}]});

#### Requires:
- jquery

#### Demo:
- [The Cathmhaol](http://prototypes.cathmhaol.com/sortedtable-jquery/)
