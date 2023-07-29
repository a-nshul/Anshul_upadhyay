const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const DB_URI ='mongodb+srv://upadhyay041298:MN7jxIo3UJStaRcK@cluster0.cn2cefu.mongodb.net/?retryWrites=true&w=majority';
const app = express();
const cors = require('cors');
app.use(cors()); 
app.use(express.json()); 
const port = 3001; // Change this port number if needed
// // Connect to MongoDB
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// // Check for database connection success
db.once('open', () => {
  console.log('Connected to the MongoDB database');
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// // Define the device schema
const deviceSchema = new mongoose.Schema({
  hostname: String,
  macAddress: String,
  ssid: String,
  password: String,
  networkSettings: {
    ip: String,
    subnetMask: String,
    gateway: String,
  },
});

 const Device = mongoose.model('Device', deviceSchema);
// Function to extract MAC address from a network interface object
function getMacAddress(networkInterface) {
  if (networkInterface && networkInterface.mac) {
    return networkInterface.mac;
  }
  return 'N/A';
}

// Function to execute shell command and parse output
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// Endpoint to get system information
app.get('/api/devices', async (req, res) => {
  try {
    const hostname = os.hostname();

    const interfaces = os.networkInterfaces();
    const networkInterfaceData = {};
    for (const [interfaceName, interfaceDetails] of Object.entries(interfaces)) {
      const macAddress = getMacAddress(interfaceDetails[0]);
      const isInternal = interfaceDetails[0]?.internal || false;
      networkInterfaceData[interfaceName] = {
        macAddress,
        isInternal,
      };
    }

    const ssid = await executeCommand('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk \'/ SSID/ {print substr($0, index($0, $2))}\'');
    const ipAddress = await executeCommand('ipconfig getifaddr en0');
    const subnetMask = await executeCommand('ipconfig getoption en0 subnet_mask');

    // You should handle password retrieval securely. Don't expose it through the API directly.
    const password = 'YOUR_PASSWORD_HERE';

    const systemInfo = {
      hostname,
      networkInterfaces: networkInterfaceData,
      ssid,
      ipAddress,
      subnetMask,
      password,
    };

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving system information' });
  }
});

// Endpoint to update network settings
// app.put('/api/update-config/:deviceId', async (req, res) => {
//   const { deviceId } = req.params;
//   console.log('deviceId:', deviceId);
//   const { ssid, password, networkSettings } = req.body;

//   // Validate the input data
//   if (!ssid) {
//     return res.status(400).json({ message: 'SSID is required for updating device configuration' });
//   }

//   try {
//     // Use findOneAndUpdate with the query based on ssid
//     const updatedDevice = await Device.findOneAndUpdate(
//       { ssid },
//       {
//         $set: {
//           password: password || undefined,
//           networkSettings: networkSettings || undefined,
//         },
//       },
//       { new: true } // Return the updated document
//     ).exec();

//     if (updatedDevice) {
//       res.json({ message: 'Device configuration updated successfully', updatedDevice });
//     } else {
//       res.status(404).json({ message: 'Device not found' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error updating device configuration' });
//   }
// });
app.put('/api/update-config/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  console.log('deviceId:', deviceId);
  const { ssid, password, networkSettings } = req.body;

  // Validate the input data
  if (!ssid) {
    return res.status(400).json({ message: 'SSID is required for updating device configuration' });
  }

  try {
    // Use findByIdAndUpdate with the query based on deviceId
    const updatedDevice = await Device.findByIdAndUpdate(
      deviceId,
      {
        ssid,
        password: password || undefined,
        networkSettings: networkSettings || undefined,
      },
      { new: true } // Return the updated document
    ).exec();

    if (updatedDevice) {
      res.json({ message: 'Device configuration updated successfully', updatedDevice });
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating device configuration' });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
