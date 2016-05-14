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

- ***object* *instance*.body**: The table body
- ***integer* *instance*.colCount**: The count of columns in the table
- ***object[]* *instance*.cols**: Names of columns in the table, defaults to col_{index}
- ***object[]* *instance*.data**: Array of objects representing table rows
- ***string* *instance*.foot**: The table footer
- ***string* *instance*.head**: The table header
- ***node* *instance*.elem**: jQuery element reference to table
- ***object[]* *instance*.sorts**: Sort keys. Each object in the array contains 'name' and 'dir', which is 1 (ascending) or -1 (descending)

- ***void* *instance*.clearSort**: Clears the sort keys
- ***void* *instance*.getSortAttribute**: Sets the object array containing sort keys using the data-sort attribute of the table
- ***void* *instance*.setSortAttribute**: Sets the data-sort attribute on the table using the sort keys
- ***void* *instance*.sort([*object[]* sortOn[, *boolean* retain]])**: Sorts the data in the table body using the sort keys provided in the data-sort attribute of the table and the <em>sortOn</em> object array (each object in the array should contain a 'name' and 'dir' property, see `*instance*.sorts`), retaining the existing sort order if <em>retain</em> is specified.
- ***string* *instance*.toHtml([*boolean* bodyOnly])**: Returns the complete table, or the table body only (without header and footer), as a string.

#### Requires:
- jquery

Examples:
- var airports = $('#airports').sortedtable({sortOn:[{name:'Country', dir:'ascending'}, {name:'City', dir:1}]});

#### Working Example 
<table class="cjl-sortable thead tbody">
<caption>10 of the world's busiest airports</caption>
<thead class="thead">
<tr><th>Country</th><th>City</th><th>Activity</th><th>Name</th><th>Latitude</th><th>Longitude</th></tr>
</thead>
<tbody>
<tr id="t1-row1"><td>US</td><td>ATL</td><td>68343</td><td>Hartsfield Jackson Atlanta International</td><td>33.636719</td><td>-84.428067</td></tr>
<tr id="t1-row2"><td>US</td><td>ORD</td><td>59692</td><td>Chicago O'Hare International</td><td>41.978603</td><td>-87.904842</td></tr>
<tr id="t1-row3"><td>US</td><td>DFW</td><td>56496</td><td>Dallas Fort Worth International</td><td>32.896828</td><td>-97.037997</td></tr>
<tr id="t1-row4"><td>US</td><td>LAX</td><td>51396</td><td>Los Angeles International</td><td>33.942536</td><td>-118.408075</td></tr>
<tr id="t1-row5"><td>CN</td><td>PEK</td><td>48226</td><td>Capital International</td><td>40.080111</td><td>116.584556</td></tr>
<tr id="t1-row6"><td>US</td><td>CLT</td><td>44583</td><td>Charlotte Douglas International</td><td>35.214</td><td>-80.943139</td></tr>
<tr id="t1-row7"><td>US</td><td>DEN</td><td>44438</td><td>Denver International</td><td>39.861656</td><td>-104.673178</td></tr>
<tr id="t1-row8"><td>US</td><td>LAS</td><td>41164</td><td>McCarran International</td><td>36.080056</td><td>-115.15225</td></tr>
<tr id="t1-row9"><td>US</td><td>IAH</td><td>39808</td><td>George Bush Intercontinental</td><td>29.984433</td><td>-95.341442</td></tr>
<tr id="t1-row10"><td>GB</td><td>LHR</td><td>37680</td><td>London Heathrow</td><td>51.4775</td><td>-0.461389</td></tr>
</tbody>
</table>
<script src="http://www.cathmhaol.com/js/jquery-1.12.3.min.js">
</script>
<script src="http://prototypes.cathmhaol.com/sortedtable-jquery/cjl-sortedtable.js">
</script>
