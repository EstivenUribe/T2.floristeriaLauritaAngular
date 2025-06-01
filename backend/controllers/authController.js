const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Obtener clave secreta y configuración desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'development_fallback_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

// Generar token de acceso
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

// Generar token de refresco
const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
};

// Generar token CSRF
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Configuración de cookies seguras
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 horas
};

// Registro de nuevo usuario
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'El usuario o email ya está registrado. Si olvidaste tu contraseña, utiliza la opción de recuperación.' 
      });
    }

    // Permitir solo 'user' o 'admin' como roles, por seguridad
    let assignedRole = 'user';
    if (role && ['admin', 'user'].includes(role)) {
      assignedRole = role;
    }

    // Crear un nuevo usuario
    const user = new User({
      username,
      email,
      password,
      role: assignedRole
    });

    // Guardar el usuario en la base de datos
    await user.save();

    // Generar tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    const csrfToken = generateCSRFToken();

    // Configurar cookies
    res.cookie('token', accessToken, cookieConfig);
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    res.cookie('csrfToken', csrfToken, {
      ...cookieConfig,
      httpOnly: false // Debe ser accesible desde JavaScript
    });

    // Responder con el usuario creado (sin la contraseña) y los tokens
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: accessToken,
      refreshToken,
      csrfToken
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error al registrar el usuario',
      error: error.message 
    });
  }
};

// Inicio de sesión
exports.signin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Verificar la contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Generar tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    const csrfToken = generateCSRFToken();

    // Configurar tiempo de expiración de cookies
    const cookieExpiration = rememberMe ? 
      { maxAge: 30 * 24 * 60 * 60 * 1000 } : // 30 días si "recordarme" está activo
      { maxAge: 24 * 60 * 60 * 1000 };       // 24 horas por defecto

    // Configurar cookies
    res.cookie('token', accessToken, { ...cookieConfig, ...cookieExpiration });
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      ...cookieExpiration,
      maxAge: cookieExpiration.maxAge * 2 // El refresh token dura el doble
    });
    res.cookie('csrfToken', csrfToken, {
      ...cookieConfig,
      ...cookieExpiration,
      httpOnly: false // Debe ser accesible desde JavaScript
    });

    // Registrar sesión en el usuario
    user.lastLogin = new Date();
    await user.save();

    // Responder con el usuario y los tokens
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: accessToken,
      refreshToken,
      csrfToken
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ 
      message: 'Error en el inicio de sesión',
      error: error.message 
    });
  }
};

// Renovar token de acceso con refresh token
exports.refreshToken = async (req, res) => {
  try {
    // Obtener refresh token
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token no proporcionado' });
    }
    
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Verificar que sea un refresh token
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'Usuario no encontrado' });
    }
    
    // Generar nuevos tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);
    const csrfToken = generateCSRFToken();
    
    // Configurar cookies
    res.cookie('token', accessToken, cookieConfig);
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    res.cookie('csrfToken', csrfToken, {
      ...cookieConfig,
      httpOnly: false
    });
    
    // Responder con los nuevos tokens
    res.status(200).json({
      token: accessToken,
      refreshToken: newRefreshToken,
      csrfToken
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expirado' });
    }
    
    res.status(403).json({ message: 'Refresh token inválido' });
  }
};

// Cerrar sesión
exports.signout = (req, res) => {
  // Limpiar cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.clearCookie('csrfToken');
  
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

// Verificar token
exports.verifyToken = (req, res) => {
  try {
    // El token ya fue verificado por el middleware
    res.status(200).json({
      message: 'Token válido',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar el token', error: error.message });
  }
};

// Obtener perfil del usuario
exports.getProfile = async (req, res) => {
  try {
    // El ID del usuario se obtiene del middleware de autenticación
    const userId = req.user.id;
    
    // Buscar usuario en la base de datos excluyendo campos sensibles
    const user = await User.findById(userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Enviar datos del perfil
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener información del perfil', 
      error: error.message 
    });
  }
};

// Actualizar perfil de usuario
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener los campos actualizables del body
    const {
      username,
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
      phone,
      birthDate,
      avatarId,
      currentPassword,
      newPassword
    } = req.body;
    
    // Encontrar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si se proporcionó la contraseña actual y una nueva, actualizar la contraseña
    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
      }
      
      user.password = newPassword;
    }
    
    // Actualizar los campos del usuario si se proporcionaron
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (phone !== undefined) user.phone = phone;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (avatarId !== undefined) user.avatarId = avatarId;
    
    // Guardar los cambios
    await user.save();
    
    // Responder con el usuario actualizado (sin incluir la contraseña)
    const updatedUser = await User.findById(userId).select('-password -refreshTokens');
    
    res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el perfil',
      error: error.message 
    });
  }
};

// Generar nuevo CSRF token
exports.getCsrfToken = (req, res) => {
  const csrfToken = generateCSRFToken();
  
  res.cookie('csrfToken', csrfToken, {
    ...cookieConfig,
    httpOnly: false
  });
  
  res.status(200).json({ csrfToken });
};