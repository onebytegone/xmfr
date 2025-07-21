# Simple List Example

This example demonstrates how to use the `xmfr` CLI tool with the `simple-list` template
to render a list of records from JSON data.

## Steps

   1. Prepare your data in JSON format (see `simple-list-data.json`).
   2. Run the following command:

      ```bash
      cat examples/simple-list/simple-list-data.json | xmfr -t simple-list > examples/simple-list/simple-list-output.html
      ```

   3. View the output HTML file (`simple-list-output.html`) in your browser.
