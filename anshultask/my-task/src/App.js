import React, { useState, useEffect } from 'react';
import './App.css';
import { message } from 'antd';
import axios from 'axios';
function App() {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [ssid, setSSID] = useState('');
  const [password, setPassword] = useState('');
  const [networkSettings, setNetworkSettings] = useState('');

  useEffect(() => {
    // Fetch device information from the API endpoint
    fetchDeviceInfo();
  }, []);

const fetchDeviceInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/devices');
    setDeviceInfo(response.data); // Update the state with fetched data
    console.log('Device Info:', response.data); // Log the fetched data to the console
  } catch (error) {
    console.error('Error fetching device information:', error);
  }
};

  const handleSSIDChange = (e) => {
    setSSID(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleNetworkSettingsChange = (e) => {
    setNetworkSettings(e.target.value);
  };


  // const handleUpdateConfig = () => {
  //   // if (!deviceId) {
  //   //   message.error('Device ID is required.');
  //   //   return;
  //   // }

  //   fetch(`http://localhost:3001/api/update-config/${deviceId}`, {
  //     method: 'PUT', 
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       ssid,
  //       password,
  //       networkSettings,
  //     }),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log('Config updated successfully:', data);
  //       message.success('Config updated successfully');
  //       fetchDeviceInfo();
  //     })
  //     .catch((error) => console.error('Error updating config:', error));
  // };
  // const handleUpdateConfig = async () => {
  //   try {
  //     // Create a payload object with the updated configuration data
  //     const payload = {
  //       ssid: ssid,
  //       password: password,
  //       networkSettings: networkSettings,
  //     };

  //     // Make the PUT request to update the configuration
  //     const response = await axios.put(`http://localhost:3001/api/update-config/${deviceId}`, payload);

  //   // Handle the response and show a success message
  //   if (response.data && response.data.updatedDevice) {
  //     message.success(response.data.message);
  //     // Optionally, you can update the deviceInfo state with the updated device data
  //     setDeviceInfo(response.data.updatedDevice);
  //   } else {
  //     message.error(response.data.message || 'Error updating device configuration');
  //   }
  // } catch (error) {
  //   console.error('Error updating device configuration:', error);
  //   message.error('Error updating device configuration. Please check the console for more details.');
  // }
  // };
  const handleUpdateConfig = async () => {
    try {
      // Ensure ssid, password, and networkSettings variables are correctly set
      if (!ssid || !password || !networkSettings) {
        message.error('Please enter all the required configuration settings.');
        return;
      }
  
      // Create a payload object with the updated configuration data
      const payload = {
        ssid: ssid,
        password: password,
        networkSettings: networkSettings,
      };
  
      // Make the PUT request to update the configuration
      const response = await axios.put(`http://localhost:3001/api/update-config/${encodeURIComponent(ssid)}`, payload);
  
      // Handle the response and show a success message
      if (response.data && response.data.updatedDevice) {
        message.success(response.data.message);
        // Optionally, you can update the deviceInfo state with the updated device data
        setDeviceInfo(response.data.updatedDevice);
      } else {
        message.error(response.data.message || 'Error updating device configuration');
      }
    } catch (error) {
      console.error('Error updating device configuration:', error);
      message.error('Error updating device configuration. Please check the console for more details.');
    }
  };
  
  return (
    <div className="App">
      <div className="device-info">
        <h2>Device Information</h2>
        <p>Hostname: {deviceInfo.hostname}</p>
        {/* <p>MAC Address: {deviceInfo.macAddress}</p> */}
        <p>MAC Address: {deviceInfo.networkInterfaces && deviceInfo.networkInterfaces.anpi0
 && deviceInfo.networkInterfaces.anpi0
.macAddress}</p>
      </div>
      <div className="config-update">
        <h2>Update Configuration</h2>
        {/* Input field for Device ID */}
        {/* <div>
          <label>Device ID:</label>
          <input type="text" value={deviceId} onChange={handleDeviceIdChange} required />
        </div> */}
        <div>
          <label>SSID:</label>
          <input type="text" value={ssid} onChange={handleSSIDChange} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} />
        </div>
        <div>
          <label>Network Settings:</label>
          <input type="text" value={networkSettings} onChange={handleNetworkSettingsChange} />
        </div>
        <button onClick={handleUpdateConfig}>Update Config</button>
      </div>
    </div>
  );
}

export default App;
