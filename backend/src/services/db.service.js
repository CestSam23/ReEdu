import mongoose from 'mongoose';

/**
 * Servicio CRUD para MongoDB
 * @param {string} modelName - Nombre del modelo a utilizar
 */
export class DBService {
  constructor(modelName) {
    this.Model = mongoose.model(modelName);
  }

  // CREATE
  async create(document) {
    try {
      const newDoc = await this.Model.create(document);
      return { success: true, data: newDoc };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // READ (Multiple)
  async find(filter = {}, options = {}) {
    try {
      const docs = await this.Model.find(filter)
        .sort(options.sort || {})
        .limit(options.limit || 0)
        .skip(options.skip || 0);
      return { success: true, data: docs };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // READ (Single)
  async findById(id) {
    try {
      const doc = await this.Model.findById(id);
      if (!doc) return { success: false, error: 'Documento no encontrado' };
      return { success: true, data: doc };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // UPDATE
  async update(id, updates) {
    try {
      const updatedDoc = await this.Model.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      if (!updatedDoc) return { success: false, error: 'Documento no encontrado' };
      return { success: true, data: updatedDoc };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // DELETE
  async delete(id) {
    try {
      const deletedDoc = await this.Model.findByIdAndDelete(id);
      if (!deletedDoc) return { success: false, error: 'Documento no encontrado' };
      return { success: true, data: deletedDoc };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Manejo centralizado de errores
  handleError(error) {
    console.error('❌ DB Error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code || 500
    };
  }
}

/**
 * Función para inicializar modelos dinámicamente
 * @param {string} name - Nombre del modelo
 * @param {mongoose.Schema} schema - Esquema de Mongoose
 */
export const defineModel = (name, schema) => {
  return mongoose.models[name] || mongoose.model(name, schema);
};