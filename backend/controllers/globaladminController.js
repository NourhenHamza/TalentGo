import jwt from 'jsonwebtoken';


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', { email, password });
    console.log('Expected credentials:', { 
      email: process.env.ADMIN_EMAIL, 
      password: process.env.ADMIN_PASSWORD 
    });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token with correct timestamp
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    console.log('Current timestamp:', currentTime);
    console.log('Current time readable:', new Date(currentTime * 1000).toISOString());

    const token = jwt.sign(
      { 
        email, 
        role: 'admin',
        iat: currentTime, // issued at time
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h' // This will automatically set the exp claim
      }
    );

    // Verify the token was created correctly
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', {
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
      iatReadable: new Date(decoded.iat * 1000).toISOString(),
      expReadable: new Date(decoded.exp * 1000).toISOString()
    });

    res.status(200).json({
      success: true,
      token,
      message: "Admin logged in successfully"
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to login"
    });
  }
};

 
export {

    loginAdmin
};
