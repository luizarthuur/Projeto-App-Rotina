// templateManager/templateManager.tsx
import { useState, useEffect } from 'react';
import './templateManager.css';

export interface TemplateTask {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  weekDays: number[]; // 0=Segunda, 1=Terça, ..., 6=Domingo
}

interface TemplateManagerProps {
  onApplyToDate: (template: TemplateTask, date: string) => void;
  onClose: () => void;
}

export default function TemplateManager({ onApplyToDate, onClose }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<TemplateTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TemplateTask | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTask | null>(null);
  const [targetDate, setTargetDate] = useState('');

  // Carregar templates salvos
  useEffect(() => {
    const stored = localStorage.getItem('routine_templates');
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Persistir templates
  useEffect(() => {
    localStorage.setItem('routine_templates', JSON.stringify(templates));
  }, [templates]);

  function saveTemplate(template: TemplateTask) {
    setTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      return exists ? prev.map(t => t.id === template.id ? template : t) : [...prev, template];
    });
    setShowForm(false);
    setEditing(null);
  }

  function deleteTemplate(id: string) {
    if (window.confirm('Excluir este template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  }

  // Formulário
  const [form, setForm] = useState({
    name: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    weekDays: [] as number[]
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveTemplate({
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      weekDays: form.weekDays
    });
    setForm({ name: '', description: '', startTime: '09:00', endTime: '10:00', weekDays: [] });
  }

  function handleApply(template: TemplateTask) {
    if (!targetDate) {
      alert('Selecione uma data');
      return;
    }
    onApplyToDate(template, targetDate);
    setSelectedTemplate(null);
    setTargetDate('');
  }

  return (
    <div className="template-manager">
      <h2>Gerenciar Templates</h2>
      <button onClick={() => setShowForm(true)}>+ Novo Template</button>
      <button onClick={onClose} className="close-templates">Fechar</button>

      {showForm && (
        <div className="template-form">
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Nome do template"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <div className="time-row">
              <label>Início: <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} /></label>
              <label>Fim: <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} /></label>
            </div>
            <div>
              <label>Dias da semana (0=Seg,1=Ter,2=Qua,3=Qui,4=Sex,5=Sáb,6=Dom):</label>
              <input
                placeholder="ex: 0,2,4"
                value={form.weekDays.join(',')}
                onChange={e => setForm({...form, weekDays: e.target.value.split(',').map(Number).filter(n => !isNaN(n))})}
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="template-list">
        {templates.length === 0 && <p>Nenhum template criado ainda.</p>}
        {templates.map(t => (
          <div key={t.id} className="template-item">
            <div className="template-info">
              <strong>{t.name}</strong> – {t.startTime} às {t.endTime}<br/>
              <small>Dias: {t.weekDays.join(', ') || 'nenhum'}</small>
              {t.description && <div className="template-desc">{t.description}</div>}
            </div>
            <div className="template-actions">
              <button onClick={() => {
                setSelectedTemplate(t);
                setTargetDate('');
              }}>Aplicar</button>
              <button onClick={() => deleteTemplate(t.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="apply-dialog">
          <h3>Aplicar template "{selectedTemplate.name}"</h3>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
          />
          <div className="dialog-buttons">
            <button onClick={() => handleApply(selectedTemplate)}>Aplicar nesta data</button>
            <button onClick={() => setSelectedTemplate(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}