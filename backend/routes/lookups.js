// routes/lookups.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Middleware to handle errors in async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


router.get('/lookupTypes', async (req, res) => {
    console.log('Received request for /lookup/lookupTypes');
    try {
        const request = new sql.Request();
        // Query to select distinct values from the LookupType column
        const result = await request.query(`SELECT DISTINCT LookupType FROM dbo.glb_Lookups ORDER BY LookupType`);

        console.log(`${result.recordset.length} distinct LookupTypes returned`);
        // The recordset will be an array of objects like { LookupType: 'Country' }
        // We might want to transform it into a simple array of strings.
        const lookupTypes = result.recordset.map(row => row.LookupType);

        res.status(200).json(lookupTypes);
    } catch (err) {
        console.error('Error fetching distinct LookupTypes:', err.message);
        res.status(500).json({ error: 'Error fetching distinct LookupTypes from database', details: err.message });
    }
});

router.get('/getallinfo', async (req, res) => {
    console.log('Received request for /lookup/getallinfo');
    try {
        // Create a new request object. mssql automatically uses the connection pool
        // established by sql.connect() in server.js.
        const request = new sql.Request();

        // Execute the SQL query to select all necessary columns from the dbo.glb_Lookups table.
        const result = await request.query(`SELECT LookupID, LookupSrc, LookupType, LookupCode, Description FROM dbo.glb_Lookups`);

        console.log(`${result.recordset.length} rows returned from dbo.glb_Lookups`);
        // Send the fetched records (available in result.recordset) as a JSON response.
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching lookups:', err.message);
        // Send a 500 status code and an error message if the query fails.
        res.status(500).json({ error: 'Error fetching lookups from database', details: err.message });
    }
});

router.get('/byType', async (req, res) => {
    // Extract the 'type' query parameter from the request
    const lookupType = req.query.type;
    console.log(`Received request for /lookup/byType with type: ${lookupType}`);

    // Check if the lookupType parameter was provided
    if (!lookupType) {
        return res.status(400).json({ error: 'LookupType parameter is required. Use /lookup/byType?type=YourType' });
    }

    try {
        const request = new sql.Request();
        // Add the lookupType parameter to the SQL request to prevent SQL injection
        request.input('lookupTypeParam', sql.VarChar, lookupType);

        // Execute the SQL query, filtering by the provided LookupType
        const result = await request.query(`SELECT LookupID, LookupSrc, LookupType, LookupCode, Description FROM dbo.glb_Lookups WHERE LookupType = @lookupTypeParam`);

        console.log(`${result.recordset.length} rows returned for LookupType: ${lookupType}`);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(`Error fetching lookups for type '${lookupType}':`, err.message);
        res.status(500).json({ error: `Error fetching lookups for type '${lookupType}' from database`, details: err.message });
    }
});




module.exports = router;