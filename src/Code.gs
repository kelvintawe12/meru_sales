/**
 * Google Apps Script to handle form submissions and write to a Google Spreadsheet
 * Deploy as a web app with access to "Anyone, even anonymous" and execute as yourself
 */

/**
 * Global configuration
 */
const SPREADSHEET_ID = '1W3KufRCzIK2k65quZfoyhEdx-SvmCZ-n1LT54XRWGsk'; // Google Spreadsheet ID
const SHEETS = {
  refinery: 'Refinery',
  fractionation: 'Fractionation',
  stocks: 'Stocks',
  mtdSummary: 'MTD_Summary',
  notifications: 'Notifications'
};

/**
 * Ensures all required sheets exist and creates them with headers if missing
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Sheet names and their headers
  const sheetConfigs = [
    {
      name: SHEETS.refinery,
      headers: [
        'Date', 'RT', 'Bleacher', 'PLF', 'BOT', 'Deaerator', 'VHE', 'DEO',
        'Opening WIP', 'Closing WIP', 'Refinery Feed', 'Bleaching Earth',
        'Phosphoric Acid', 'Citric Acid', 'Feed FFA', 'CPOL', 'Moisture',
        'Oil in Spent Earth', 'Oil in PFAD', 'Final Oil FFA', 'Feed MT',
        'Refined Oil MT', 'PFAD Production MT', 'Loss MT'
      ]
    },
    {
      name: SHEETS.fractionation,
      headers: [
        'Date', 'CLX1', 'CLX2', 'CLX3', 'CLX4', 'Squeezing Tank', 'Olein Tank',
        'Stearin Hopper', 'Opening WIP', 'Fractionation Feed', 'Closing WIP',
        'Olein MT', 'Stearin MT', 'Phenomol Consumption', 'Olein Percentage',
        'Stearin Percentage'
      ]
    },
    {
      name: SHEETS.stocks,
      headers: [
        'Date', 'CPO', 'Refined Oil', 'Deodorizer Power', 'Fractionation Power',
        'Bleaching Earth', 'Phosphoric Acid', 'Tank No', 'Oil Type', 'Tank Height',
        'Calibration', 'Max Storage Capacity', 'Dip (cm)', 'Stock (kg)', 'Particulars', 'Qty (MT)'
      ]
    },
    {
      name: SHEETS.mtdSummary,
      headers: [
        'Timestamp', 'Refinery Feed', 'Refined Oil', 'Refined Oil Yield', 'PFAD',
        'PFAD Yield', 'Loss', 'Loss Yield', 'Bleaching Earth', 'Bleaching Earth Dosage',
        'Phosphoric Acid', 'Phosphoric Acid Dosage', 'Citric Acid', 'Citric Acid Dosage',
        'Fractionation Feed', 'Olein', 'Olein Yield', 'Stearin', 'Stearin Yield'
      ]
    },
    {
      name: SHEETS.notifications,
      headers: ['Timestamp', 'Type', 'Message', 'Read']
    }
  ];

  sheetConfigs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.appendRow(cfg.headers);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
    }
  });
}

/**
 * doPost function to handle HTTP POST requests
 */
function doPost(e) {
  try {
    initializeSheets();
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName || determineSheet(data);

    if (!sheetName) {
      return createResponse(400, 'Sheet name not specified');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return createResponse(400, 'Sheet ' + sheetName + ' not found');
    }

    appendToSheet(sheet, data, sheetName);
    addNotification(data, sheetName);

    return createResponse(200, 'Data submitted successfully');
  } catch (error) {
    Logger.log('Error: ' + error);
    return createResponse(500, 'Error processing request: ' + error.message);
  }
}

/**
 * Determines the target sheet based on form data
 */
function determineSheet(data) {
  if (data.type === 'refinery') return SHEETS.refinery;
  if (data.type === 'fractionation') return SHEETS.fractionation;
  if (data.cpo && data.refinedoil && data.tanks) return SHEETS.stocks;
  if (data.refineryFeed && data.refinedOil && !data.date) return SHEETS.mtdSummary;
  return null;
}

/**
 * Appends data to the specified sheet
 */
function appendToSheet(sheet, data, sheetName) {
  switch (sheetName) {
    case SHEETS.refinery:
      appendRefineryData(sheet, data);
      break;
    case SHEETS.fractionation:
      appendFractionationData(sheet, data);
      break;
    case SHEETS.stocks:
      appendStocksData(sheet, data);
      break;
    case SHEETS.mtdSummary:
      appendMTDSummaryData(sheet, data);
      break;
    default:
      throw new Error('Unknown sheet type');
  }
}

/**
 * Appends refinery form data to the Refinery sheet
 */
function appendRefineryData(sheet, data) {
  const headers = [
    'Date', 'RT', 'Bleacher', 'PLF', 'BOT', 'Deaerator', 'VHE', 'DEO',
    'Opening WIP', 'Closing WIP', 'Refinery Feed', 'Bleaching Earth',
    'Phosphoric Acid', 'Citric Acid', 'Feed FFA', 'CPOL', 'Moisture',
    'Oil in Spent Earth', 'Oil in PFAD', 'Final Oil FFA', 'Feed MT',
    'Refined Oil MT', 'PFAD Production MT', 'Loss MT'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  const row = [
    data.date || new Date().toISOString().split('T')[0],
    data.rt || '',
    data.bleacher || '',
    data.plf || '',
    data.bot || '',
    data.deaerator || '',
    data.vhe || '',
    data.deo || '',
    data.openingWIP || '',
    data.closingWIP || '',
    data.refineryFeed || '',
    data.bleachingEarth || '',
    data.phosphoricAcid || '',
    data.citricAcid || '',
    data.feedFFA || '',
    data.cpol || '',
    data.moisture || '',
    data.oilInSpentEarth || '',
    data.oilInPFAD || '',
    data.finalOilFFA || '',
    data.feedMT || '',
    data.refinedOilMT || '',
    data.pfadProductionMT || '',
    data.lossMT || ''
  ];
  sheet.appendRow(row);
}

/**
 * Appends fractionation form data to the Fractionation sheet
 */
function appendFractionationData(sheet, data) {
  const headers = [
    'Date', 'CLX1', 'CLX2', 'CLX3', 'CLX4', 'Squeezing Tank', 'Olein Tank',
    'Stearin Hopper', 'Opening WIP', 'Fractionation Feed', 'Closing WIP',
    'Olein MT', 'Stearin MT', 'Phenomol Consumption', 'Olein Percentage',
    'Stearin Percentage'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  const row = [
    data.date || new Date().toISOString().split('T')[0],
    data.clx1 || '',
    data.clx2 || '',
    data.clx3 || '',
    data.clx4 || '',
    data.squeezingTank || '',
    data.oleinTank || '',
    data.stearinHopper || '',
    data.openingWIP || '',
    data.fractionationFeed || '',
    data.closingWIP || '',
    data.oleinMT || '',
    data.stearinMT || '',
    data.phenomolConsumption || '',
    data.oleinPercentage || '',
    data.stearinPercentage || ''
  ];
  sheet.appendRow(row);
}

/**
 * Appends stocks form data to the Stocks sheet
 */
function appendStocksData(sheet, data) {
  const headers = [
    'Date', 'CPO', 'Refined Oil', 'Deodorizer Power', 'Fractionation Power',
    'Bleaching Earth', 'Phosphoric Acid', 'Tank No', 'Oil Type', 'Tank Height',
    'Calibration', 'Max Storage Capacity', 'Dip (cm)', 'Stock (kg)', 'Particulars', 'Qty (MT)'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  // Append a row for each tank
  if (Array.isArray(data.tanks)) {
    data.tanks.forEach(function(tank) {
      const row = [
        data.date || new Date().toISOString().split('T')[0],
        data.cpo && data.cpo.value ? data.cpo.value : '',
        data.refinedoil && data.refinedoil.value ? data.refinedoil.value : '',
        data.deodorizerPower && data.deodorizerPower.value ? data.deodorizerPower.value : '',
        data.fractionationPower && data.fractionationPower.value ? data.fractionationPower.value : '',
        data.bleachingEarth && data.bleachingEarth.value ? data.bleachingEarth.value : '',
        data.phosphoricAcid && data.phosphoricAcid.value ? data.phosphoricAcid.value : '',
        tank.tankNo || '',
        tank.oilType || '',
        tank.tankHeight || '',
        tank.calibration || '',
        tank.maxStorageCapacity || '',
        tank.dipCm || '',
        tank.stock || '',
        tank.particulars || '',
        tank.qtyMT || ''
      ];
      sheet.appendRow(row);
    });
  }
}

/**
 * Appends MTD summary data to the MTD_Summary sheet
 */
function appendMTDSummaryData(sheet, data) {
  const headers = [
    'Timestamp', 'Refinery Feed', 'Refined Oil', 'Refined Oil Yield', 'PFAD',
    'PFAD Yield', 'Loss', 'Loss Yield', 'Bleaching Earth', 'Bleaching Earth Dosage',
    'Phosphoric Acid', 'Phosphoric Acid Dosage', 'Citric Acid', 'Citric Acid Dosage',
    'Fractionation Feed', 'Olein', 'Olein Yield', 'Stearin', 'Stearin Yield'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  const row = [
    new Date().toISOString(),
    data.refineryFeed || '',
    data.refinedOil || '',
    data.refinedOilYield || '',
    data.pfad || '',
    data.pfadYield || '',
    data.loss || '',
    data.lossYield || '',
    data.bleachingEarth || '',
    data.bleachingEarthDosage || '',
    data.phosphoricAcid || '',
    data.phosphoricAcidDosage || '',
    data.citricAcid || '',
    data.citricAcidDosage || '',
    data.fractionationFeed || '',
    data.olein || '',
    data.oleinYield || '',
    data.stearin || '',
    data.stearinYield || ''
  ];
  sheet.appendRow(row);
}

/**
 * Adds a notification to the Notifications sheet
 */
function addNotification(data, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.notifications);
  if (!sheet) return;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Type', 'Message', 'Read']);
  }
  const message = 'New ' + sheetName + ' data submitted on ' + (data.date || new Date().toISOString().split('T')[0]);
  sheet.appendRow([new Date().toISOString(), sheetName, message, false]);
}

/**
 * Creates a standardized JSON response
 */
function createResponse(status, message) {
  return withCORS(
    ContentService.createTextOutput(
      JSON.stringify({ status: status, message: message })
    ).setMimeType(ContentService.MimeType.JSON)
  );
}

/**
 * doGet function to handle GET requests (for fetching data)
 */
function doGet(e) {
  try {
    initializeSheets();
    const params = e.parameter;
    const endpoint = params.endpoint;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (endpoint) {
      case 'dashboard-stats':
        return getDashboardStats(ss, params.date);
      case 'dashboard-submissions':
        return getDashboardSubmissions(ss, params.date);
      case 'analytics/daily-feed':
        return getDailyFeed(ss, params.date);
      case 'analytics/product-distribution':
        return getProductDistribution(ss, params.date);
      case 'analytics/yield-histogram':
        return getYieldHistogram(ss, params.date);
      case 'trends/cpo-refinedoil':
        return getCpoRefinedOilTrend(ss, params.start, params.end);
      case 'trends/deodorizer-fractionation':
        return getDeodorizerFractionationTrend(ss, params.start, params.end);
      case 'trends/chemical-usage':
        return getChemicalUsageTrend(ss, params.start, params.end);
      case 'trends/tanks':
        return getTanksTrend(ss, params.start, params.end);
      case 'stocks':
        return getStocks(ss);
      case 'chemicals':
        return getChemicals(ss);
      case 'mtd-summary':
        return getMTDSummary(ss);
      case 'notifications':
        return getNotifications(ss);
      default:
        return createResponse(400, 'Invalid endpoint');
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    return createResponse(500, 'Error processing request: ' + error.message);
  }
}

/**
 * No-op for CORS, handled by proxy
 */
function withCORS(output) {
  return output;
}

// --- GET endpoint helpers below ---

function getDashboardStats(ss, date) {
  // Example static stats, replace with your logic as needed
  const stats = [
    {
      label: 'Total Feed',
      value: '1393.4 MT',
      icon: 'DropletIcon',
      bg: 'bg-blue-100',
      sub: '+2.5% from last month',
      subIcon: 'TrendingUpIcon',
      subClass: 'text-green-600'
    },
    {
      label: 'Refined Oil',
      value: '1331.4 MT',
      icon: 'BarChart3Icon',
      bg: 'bg-green-100',
      sub: '95.5% yield',
      subIcon: 'TrendingUpIcon',
      subClass: 'text-green-600'
    },
    {
      label: 'PFAD',
      value: '54.2 MT',
      icon: 'ScaleIcon',
      bg: 'bg-amber-100',
      sub: '3.9% of total',
      subClass: 'text-gray-600'
    },
    {
      label: 'Olein Production',
      value: '850.5 MT',
      icon: 'BarChart3Icon',
      bg: 'bg-purple-100',
      sub: '85% of fractionation feed',
      subClass: 'text-gray-600'
    }
  ];
  return withCORS(ContentService.createTextOutput(JSON.stringify(stats)).setMimeType(ContentService.MimeType.JSON));
}

function getDashboardSubmissions(ss, date) {
  // Example static submissions, replace with your logic as needed
  const submissions = [
    {
      id: 1,
      type: 'Refinery Form',
      time: '09:30 AM',
      user: 'John Doe',
      data: {
        feed: '45.2 MT',
        output: '43.1 MT',
        yield: '95.4%'
      }
    },
    {
      id: 2,
      type: 'Stock Form',
      time: '10:15 AM',
      user: 'Jane Smith',
      data: {
        cpo: '1250 kg',
        rbd: '1100 kg'
      }
    }
  ];
  return withCORS(ContentService.createTextOutput(JSON.stringify(submissions)).setMimeType(ContentService.MimeType.JSON));
}

function getDailyFeed(ss, date) {
  const refinerySheet = ss.getSheetByName(SHEETS.refinery);
  if (!refinerySheet) {
    return createResponse(400, 'Refinery sheet not found');
  }
  const data = refinerySheet.getDataRange().getValues();
  var filtered = data.filter(function(row) {
    try {
      return row[0] && row[0].toISOString && row[0].toISOString().split('T')[0] === date;
    } catch (e) {
      return false;
    }
  }).map(function(row) {
    return {
      date: row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '',
      feed: parseFloat(row[10]) || 0 // Refinery Feed
    };
  });
  return withCORS(ContentService.createTextOutput(JSON.stringify(filtered)).setMimeType(ContentService.MimeType.JSON));
}

function getProductDistribution(ss, date) {
  const fractionationSheet = ss.getSheetByName(SHEETS.fractionation);
  if (!fractionationSheet) {
    return createResponse(400, 'Fractionation sheet not found');
  }
  const data = fractionationSheet.getDataRange().getValues();
  const filtered = data.filter(function(row) {
    try {
      return row[0] && row[0].toISOString && row[0].toISOString().split('T')[0] === date;
    } catch (e) {
      return false;
    }
  });
  const totalOlein = filtered.reduce(function(sum, row) { return sum + (parseFloat(row[11]) || 0); }, 0);
  const totalStearin = filtered.reduce(function(sum, row) { return sum + (parseFloat(row[12]) || 0); }, 0);
  const distribution = [
    { label: 'Olein', value: totalOlein },
    { label: 'Stearin', value: totalStearin }
  ].filter(function(item) { return item.value > 0; });
  return withCORS(ContentService.createTextOutput(JSON.stringify(distribution)).setMimeType(ContentService.MimeType.JSON));
}

function getYieldHistogram(ss, date) {
  const refinerySheet = ss.getSheetByName(SHEETS.refinery);
  if (!refinerySheet) {
    return createResponse(400, 'Refinery sheet not found');
  }
  const data = refinerySheet.getDataRange().getValues();
  const yields = data.filter(function(row) {
    try {
      return row[0] && row[0].toISOString && row[0].toISOString().split('T')[0] === date;
    } catch (e) {
      return false;
    }
  }).map(function(row) {
    const refinedOil = parseFloat(row[21]) || 0;
    const feed = parseFloat(row[10]) || 0;
    return feed ? (refinedOil / feed) * 100 : 0;
  });
  const bins = [0, 90, 92, 94, 96, 98, 100];
  const histogram = bins.slice(0, -1).map(function(bin, i) {
    return {
      range: bin + '-' + bins[i+1],
      count: yields.filter(function(y) { return y >= bin && y < bins[i+1]; }).length
    };
  });
  return withCORS(ContentService.createTextOutput(JSON.stringify(histogram)).setMimeType(ContentService.MimeType.JSON));
}

function getCpoRefinedOilTrend(ss, start, end) {
  const stocksSheet = ss.getSheetByName(SHEETS.stocks);
  if (!stocksSheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = stocksSheet.getDataRange().getValues();
  const filtered = data.filter(function(row) {
    try {
      const date = row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '';
      return (!start || date >= start) && (!end || date <= end);
    } catch (e) {
      return false;
    }
  });
  const trend = filtered.map(function(row) {
    return {
      date: row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '',
      cpo: parseFloat(row[1]) || 0,
      refinedOil: parseFloat(row[2]) || 0
    };
  });
  return withCORS(ContentService.createTextOutput(JSON.stringify(trend)).setMimeType(ContentService.MimeType.JSON));
}

function getDeodorizerFractionationTrend(ss, start, end) {
  const stocksSheet = ss.getSheetByName(SHEETS.stocks);
  if (!stocksSheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = stocksSheet.getDataRange().getValues();
  const filtered = data.filter(function(row) {
    try {
      const date = row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '';
      return (!start || date >= start) && (!end || date <= end);
    } catch (e) {
      return false;
    }
  });
  const trend = filtered.map(function(row) {
    return {
      date: row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '',
      deodorizerPower: parseFloat(row[3]) || 0,
      fractionationPower: parseFloat(row[4]) || 0
    };
  });
  return withCORS(ContentService.createTextOutput(JSON.stringify(trend)).setMimeType(ContentService.MimeType.JSON));
}

function getChemicalUsageTrend(ss, start, end) {
  const stocksSheet = ss.getSheetByName(SHEETS.stocks);
  if (!stocksSheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = stocksSheet.getDataRange().getValues();
  const filtered = data.filter(row => {
    try {
      const date = row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '';
      return (!start || date >= start) && (!end || date <= end);
    } catch (e) {
      return false;
    }
  });
  const trend = filtered.map(row => ({
    date: row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '',
    bleachingEarth: parseFloat(row[5]) || 0,
    phosphoricAcid: parseFloat(row[6]) || 0,
    citricAcid: 0 // Placeholder, as citricAcid not in stocks form
  }));
  return withCORS(ContentService.createTextOutput(JSON.stringify(trend)).setMimeType(ContentService.MimeType.JSON));
}

function getTanksTrend(ss, start, end) {
  const stocksSheet = ss.getSheetByName(SHEETS.stocks);
  if (!stocksSheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = stocksSheet.getDataRange().getValues();
  const filtered = data.filter(row => {
    try {
      const date = row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '';
      return (!start || date >= start) && (!end || date <= end);
    } catch (e) {
      return false;
    }
  });
  const trend = filtered.map(row => ({
    date: row[0] && row[0].toISOString ? row[0].toISOString().split('T')[0] : '',
    tanks: parseFloat(row[15]) || 0 // Qty MT as proxy for tank count
  }));
  return withCORS(ContentService.createTextOutput(JSON.stringify(trend)).setMimeType(ContentService.MimeType.JSON));
}

function getStocks(ss) {
  const sheet = ss.getSheetByName(SHEETS.stocks);
  if (!sheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = sheet.getDataRange().getValues();
  const stocks = data.slice(1).map((row, index) => ({
    id: index + 1,
    date: row[0] ? row[0].toString() : '',
    cpo: [{ value: parseFloat(row[1]) || 0 }],
    refinedOil: [{ value: parseFloat(row[2]) || 0 }],
    deodorizerPower: [{ value: parseFloat(row[3]) || 0 }],
    fractionationPower: [{ value: parseFloat(row[4]) || 0 }],
    bleachingEarth: [{ quantity: parseFloat(row[5]) || 0 }],
    phosphoricAcid: [{ quantity: parseFloat(row[6]) || 0 }],
    tanks: [
      {
        tankNo: row[7],
        oilType: row[8],
        tankHeight: parseFloat(row[9]) || 0,
        calibration: parseFloat(row[10]) || 0,
        maxStorageCapacity: parseFloat(row[11]) || 0,
        dipCm: parseFloat(row[12]) || 0,
        stock: parseFloat(row[13]) || 0,
        particulars: row[14],
        qtyMT: parseFloat(row[15]) || 0
      }
    ]
  }));
  return withCORS(ContentService.createTextOutput(JSON.stringify(stocks)).setMimeType(ContentService.MimeType.JSON));
}

function getChemicals(ss) {
  const sheet = ss.getSheetByName(SHEETS.stocks);
  if (!sheet) {
    return createResponse(400, 'Stocks sheet not found');
  }
  const data = sheet.getDataRange().getValues();
  const chemicals = data.slice(1).map((row, index) => ({
    id: index + 1,
    date: row[0] ? row[0].toString() : '',
    feedMT: parseFloat(row[10]) || 0,
    bleachingEarth: [{ quantity: parseFloat(row[5]) || 0 }],
    phosphoricAcid: [{ quantity: parseFloat(row[6]) || 0 }],
    citricAcid: [{ quantity: 0 }] // Placeholder
  }));
  return withCORS(ContentService.createTextOutput(JSON.stringify(chemicals)).setMimeType(ContentService.MimeType.JSON));
}

function getMTDSummary(ss) {
  const sheet = ss.getSheetByName(SHEETS.mtdSummary);
  if (!sheet) {
    return createResponse(400, 'MTD_Summary sheet not found');
  }
  const data = sheet.getDataRange().getValues();
  const latest = data[data.length - 1] || [];
  const summary = {
    refineryFeed: latest[1] || '',
    refinedOil: latest[2] || '',
    refinedOilYield: latest[3] || '',
    pfad: latest[4] || '',
    pfadYield: latest[5] || '',
    loss: latest[6] || '',
    lossYield: latest[7] || '',
    bleachingEarth: latest[8] || '',
    bleachingEarthDosage: latest[9] || '',
    phosphoricAcid: latest[10] || '',
    phosphoricAcidDosage: latest[11] || '',
    citricAcid: latest[12] || '',
    citricAcidDosage: latest[13] || '',
    fractionationFeed: latest[14] || '',
    olein: latest[15] || '',
    oleinYield: latest[16] || '',
    stearin: latest[17] || '',
    stearinYield: latest[18] || ''
  };
  return withCORS(ContentService.createTextOutput(JSON.stringify(summary)).setMimeType(ContentService.MimeType.JSON));
}

function getNotifications(ss) {
  const sheet = ss.getSheetByName(SHEETS.notifications);
  if (!sheet) {
    return createResponse(400, 'Notifications sheet not found');
  }
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return withCORS(ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON));
  const notifications = data.slice(1).map((row, i) => ({
    id: i + 1,
    timestamp: row[0],
    type: row[1],
    message: row[2],
    read: row[3] === true || row[3] === 'TRUE'
  }));
  return withCORS(ContentService.createTextOutput(JSON.stringify(notifications)).setMimeType(ContentService.MimeType.JSON));
}