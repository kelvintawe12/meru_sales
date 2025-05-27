# Meru Refinery Backend

This is the backend server for the Meru Refinery Fractionation project.

## Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Start the server:
   ```
   npm start
   ```

   The server will run on port 5000 by default.

## API Endpoints

### POST /api/stocks

Accepts stock data in JSON format.

Example request body:
```json
{
  "date": "2024-06-01",
  "cpo": { "current": "100", "previous": "90", "difference": "10" },
  "refinedOil": { "current": "50", "previous": "45", "difference": "5" },
  "deodorizerPower": { "current": "30", "previous": "25", "difference": "5" },
  "fractionationPower": { "current": "20", "previous": "18", "difference": "2" },
  "bleachingEarth": { "bags": "10", "weightPerUnit": "25", "total": "250" },
  "phosphoricAcid": { "bags": "5", "weightPerUnit": "35", "total": "175" },
  "tanks": [
    {
      "tankNo": "1",
      "oilType": "CPOL",
      "tankHeight": 10,
      "calibration": 71,
      "maxStorageCapacity": 710,
      "dipCm": "5",
      "stock": 355,
      "particulars": "CPOL",
      "qtyMT": 0.36
    }
  ]
}
```

### POST /api/chemicals

Accepts chemical consumption data in JSON format.

Example request body:
```json
{
  "date": "2024-06-01",
  "feedMT": "100",
  "bleachingEarth": { "quantity": "10", "dosage": "0.1" },
  "phosphoricAcid": { "quantity": "5", "dosage": "0.05" },
  "citricAcid": { "quantity": "3", "dosage": "0.03" }
}
```

## Testing Endpoints

You can test the endpoints using tools like curl or Postman.

Example curl command to test /api/stocks:
```
curl -X POST http://localhost:5000/api/stocks -H "Content-Type: application/json" -d @sample_stock.json
```

Example curl command to test /api/chemicals:
```
curl -X POST http://localhost:5000/api/chemicals -H "Content-Type: application/json" -d @sample_chemical.json
```

Replace `sample_stock.json` and `sample_chemical.json` with your JSON files containing the request bodies.

## Offline Sync Considerations

- Offline sync is typically handled on the frontend.
- You can implement local storage or IndexedDB to queue requests when offline.
- When the connection is restored, sync the queued data with the backend.
}
   npm install
   cd backend
