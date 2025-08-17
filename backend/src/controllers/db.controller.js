import { DBService } from '../services/db.service.js';

export class DBController {
  constructor(modelName) {
    this.service = new DBService(modelName);
  }

  create = async (req, res) => {
    const { success, data, error } = await this.service.create(req.body);
    if (!success) return res.status(400).json({ error });
    res.status(201).json(data);
  };

  findAll = async (req, res) => {
    const { success, data, error } = await this.service.find(req.query);
    if (!success) return res.status(500).json({ error });
    res.json(data);
  };

  findOne = async (req, res) => {
    const { success, data, error } = await this.service.findById(req.params.id);
    if (!success) return res.status(404).json({ error });
    res.json(data);
  };

  update = async (req, res) => {
    const { success, data, error } = await this.service.update(req.params.id, req.body);
    if (!success) return res.status(error.includes('no encontrado') ? 404 : 400).json({ error });
    res.json(data);
  };

  delete = async (req, res) => {
    const { success, data, error } = await this.service.delete(req.params.id);
    if (!success) return res.status(404).json({ error });
    res.status(204).json();
  };
}