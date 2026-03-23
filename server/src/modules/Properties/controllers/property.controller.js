import { Property } from "../models/property.model.js";
import { Alert } from "../models/alert.model.js";
import logger from "../../../utils/logger.js";
import propertyEvents from "../events/property.events.js";

export const createProperty = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const propertyData = { ...req.body, created_by: userId };
    
    const insertId = await Property.create(propertyData);

    logger.info(`PropertyController:createProperty User ${userId} created property ${insertId}`);
    
    // Si se crea directamente como publicado, disparar evento
    if (propertyData.status === 'PUBLICADO') {
      const newProp = await Property.findById(insertId);
      propertyEvents.emit('propertyPublished', newProp);
    }

    res.status(201).json({ message: "Inmueble creado con éxito", id: insertId });
  } catch (error) {
    logger.error(`PropertyController:createProperty Error: ${error.message}`);
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.sub;

  try {
    const oldProp = await Property.findById(id);
    if (!oldProp) {
      return res.status(404).json({ error: "Inmueble no encontrado" });
    }

    const affectedRows = await Property.update(id, req.body, userId);
    if (!affectedRows) {
      return res.status(400).json({ error: "No se pudo actualizar el inmueble" });
    }

    const newProp = await Property.findById(id);

    // Si cambió de BORRADOR a PUBLICADO
    if (oldProp.status !== 'PUBLICADO' && newProp.status === 'PUBLICADO') {
      propertyEvents.emit('propertyPublished', newProp);
    }

    logger.info(`PropertyController:updateProperty User ${userId} updated property ${id}`);
    res.json({ message: "Inmueble actualizado con éxito", data: newProp });
  } catch (error) {
    logger.error(`PropertyController:updateProperty Error: ${error.message}`);
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  const { id } = req.params;

  try {
    const affectedRows = await Property.delete(id);
    if (!affectedRows) {
      return res.status(404).json({ error: "Inmueble no encontrado" });
    }

    logger.info(`PropertyController:deleteProperty Property ${id} deleted`);
    res.json({ message: "Inmueble eliminado con éxito" });
  } catch (error) {
    logger.error(`PropertyController:deleteProperty Error: ${error.message}`);
    next(error);
  }
};

export const getPropertiesPublic = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    // Solo mostramos publicados al público general
    const filters = { status: 'PUBLICADO', userId };
    
    if (req.query.operation_type) filters.operation_type = req.query.operation_type;
    if (req.query.property_type) filters.property_type = req.query.property_type;

    const properties = await Property.findAll(filters);
    res.json({ data: properties });
  } catch (error) {
    logger.error(`PropertyController:getPropertiesPublic Error: ${error.message}`);
    next(error);
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const locations = await Property.getUniqueLocations();
    res.json({ data: locations });
  } catch (error) {
    logger.error(`PropertyController:getLocations Error: ${error.message}`);
    next(error);
  }
};

export const getPropertiesAdmin = async (req, res, next) => {
  try {
    const properties = await Property.findAll(); // Sin filtro de status
    res.json({ data: properties });
  } catch (error) {
    logger.error(`PropertyController:getPropertiesAdmin Error: ${error.message}`);
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.sub;
  try {
    const property = await Property.findById(id, userId);
    if (!property) {
      return res.status(404).json({ error: "Inmueble no encontrado" });
    }
    res.json({ data: property });
  } catch (error) {
    logger.error(`PropertyController:getPropertyById Error: ${error.message}`);
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const statsData = await Property.getDashboardStats();
    res.json({ data: statsData });
  } catch (error) {
    logger.error(`PropertyController:getDashboardStats Error: ${error.message}`);
    next(error);
  }
};
