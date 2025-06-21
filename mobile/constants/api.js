// For React Native, we need to use the computer's IP address instead of localhost
// Choose the appropriate option based on your testing environment:

// OPTION 1: For Android Emulator
export const API_URL = "http://10.0.2.2:5000/api";

// OPTION 2: For iOS Simulator
// export const API_URL = "http://localhost:5001/api";

// OPTION 3: For physical device on same network (replace with your computer's actual IP)
// export const API_URL = "http://192.168.1.X:5001/api";