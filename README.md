jquery-plugins
==========

## What is this?

**jquery-plugins** are JavaScript plug-ins for jquery.

Each library is documented, and none are minified. If you want a minified version, please feel free to run the code through a minifier - I happen to like YUI Compressor. It is my intention to only commit un-minified versions to this repo so that all of the comments are intact and other engineers can easily see what I'm doing, how I'm doing it, and *most importantly*, why I'm doing it.

## Plug-ins in the collection

### *cjl-sortedtable*
Creates a sorted (and sortable) table directly from markup, enabling the developer to maintain their *progressive enhancement* practice. The sort order may be specified either in the markup, using a `data-sort` attribute on the table, or in the script call. The first column is set in the sort order by a click on the column header. Columns can be added to the multi-column sort order with a shift+click. Clicking a column already in the sort order toggles the sort order between ascending and descending.

In the abscence of text in a column header, column names are defaulted to 'col_' followed by the zero-based column index. For example, the first column is col_0 and the third column is col_2. Because column names will default to a non-empty string, the table can be sorted using the default column names, e.g., `*instance*.sort([{name:'col_0', dir:1}])`. It is ***strongly*** recommended that column names be provided in the markup, however, as the lack of column names will break accessibility rules.

The table sort order can be specified in the markup by providing the `data-sort` attribute. The `data-sort` attribute contains a comma-separated list of column names with a direction indicator - either '+' (ascending) or '-' (descending). For example, if your table contains a column called 'Longitude' and you wish to sort the locations east to west simply use `data-sort="Longitude-"` to sort the data. If the column is unlabeled, use the default column name, e.g., `data-sort="col_0+,col_1+"`.

Columns can be excluded from the sort order by either specifying an array of column names in the `settings` object array property `exclude`, e.g., {exclude:['Email', 'Telephone']} or in the markup by providing the `data-sort-exclude` attribute for the column and setting it to "true", e.g., &lt;th data-sort-exclude="true"&gt;Email&lt;/th&gt; or by setting the `data-sort-exclude` attribute on the table to a comma-separated list, e.g., &lt;table id="contacts" data-sort-exclude="Email, Telephone"&gt;.

Columns to be used in sorting may be identified in the the constructor either as an object array, $('#contacts').sortedtable([{name:'Surname'}, {name:'Given Name', dir:'descending'}]) or as a property of the `settings` object, e.g, $('#contacts').sortedtable({sort:[{name:'Surname'}, {name:'Given Name', dir:'descending'}], exclude:['Email', 'Telephone']})

#### Syntax:
*object* $(*selector*).sortedtable([*object[]* keys])  
*object* $(*selector*).sortedtable([*object* settings])

##### Properties
- ***object* *instance*.body**: The table body
- ***string* *instance*.foot**: The table footer
- ***string* *instance*.head**: The table header
- ***node* *instance*.elem**: jQuery element reference to table

##### Methods
- ***void* *instance*.clearSort**: Clears the sort keys
- ***void* *instance*.sort([*object[]* sortOn[, *boolean* retain]])**: Sorts the data in the table body using the sort keys provided in the data-sort attribute of the table and the <em>sortOn</em> object array (each object in the array should contain a 'name' and 'dir' property, see `*instance*.sorts`), retaining the existing sort order if <em>retain</em> is specified.

##### Examples
- $('#airports').sortedtable([{name:'Country', dir:'descending'}, {name:'City', dir:1}]);
- $('#airports').sortedtable([{name:'Longitude'}]);
- $('#airports').sortedtable();

#### Requires:
- jquery

#### Demo:
- [The Cathmhaol](http://prototypes.cathmhaol.com/sortedtable-jquery/)
