import { Favorite } from "../models/favorite.model.js";
import { User } from "../../Users-Auth/models/user.model.js";
import logger from "../../../utils/logger.js";
import eventBus, { EVENTS } from "../../../config/eventBus.js";

export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { propertyId } = req.params;

    const result = await Favorite.toggle(userId, propertyId);
    
    // Si se añadió a favoritos y trajo la dirección, lo emitimos
    if (result.isFavorite && result.property_address) {
      // Obtenemos el nombre del usuario para el log
      const fullUser = await User.findById({id:userId});
      const userName = fullUser ? fullUser.username : 'Usuario';
      
      eventBus.emit(EVENTS.PROPERTY.FAVORITED, { 
        user_id: userId, 
        user_name: userName, 
        property_id: propertyId, 
        property_address: result.property_address 
      });
    }

    res.json({ 
      message: result.isFavorite ? "Añadido a favoritos" : "Eliminado de favoritos",
      isFavorite: result.isFavorite 
    });
  } catch (error) {
    logger.error(`FavoriteController:toggleFavorite Error: ${error.message}`);
    next(error);
  }
};

export const getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const favorites = await Favorite.findByUserId(userId);
    
    res.json({ data: favorites });
  } catch (error) {
    logger.error(`FavoriteController:getMyFavorites Error: ${error.message}`);
    next(error);
  }
};

export const getTopFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.getTopFavorites();
    res.json({ data: favorites });
  } catch (error) {
    logger.error(`FavoriteController:getTopFavorites Error: ${error.message}`);
    next(error);
  }
};
