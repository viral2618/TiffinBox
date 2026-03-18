'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Save } from 'lucide-react';

interface RecipeTemplateFormProps {
  dishes: Array<{ id: string; name: string }>;
  onSubmit: (data: RecipeTemplateData) => void;
  loading?: boolean;
}

interface RecipeTemplateData {
  dishId: string;
  prepTime: number;
  bakeTime: number;
  coolTime: number;
  shelfLife: number;
  batchSize: number;
}

export function RecipeTemplateForm({ dishes, onSubmit, loading = false }: RecipeTemplateFormProps) {
  const [formData, setFormData] = useState<RecipeTemplateData>({
    dishId: '',
    prepTime: 0,
    bakeTime: 0,
    coolTime: 0,
    shelfLife: 0,
    batchSize: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof RecipeTemplateData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (field === 'dishId' ? value : parseInt(value) || 0) : value
    }));
  };

  const isValid = formData.dishId && 
    formData.prepTime > 0 && 
    formData.bakeTime > 0 && 
    formData.coolTime > 0 && 
    formData.shelfLife > 0 && 
    formData.batchSize > 0;

  const totalTime = formData.prepTime + formData.bakeTime + formData.coolTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Create Recipe Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dish">Select Dish</Label>
            <Select value={formData.dishId} onValueChange={(value) => handleInputChange('dishId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dish..." />
              </SelectTrigger>
              <SelectContent>
                {dishes.map((dish) => (
                  <SelectItem key={dish.id} value={dish.id}>
                    {dish.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                min="1"
                value={formData.prepTime || ''}
                onChange={(e) => handleInputChange('prepTime', e.target.value)}
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <Label htmlFor="bakeTime">Bake Time (minutes)</Label>
              <Input
                id="bakeTime"
                type="number"
                min="1"
                value={formData.bakeTime || ''}
                onChange={(e) => handleInputChange('bakeTime', e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coolTime">Cool Time (minutes)</Label>
              <Input
                id="coolTime"
                type="number"
                min="1"
                value={formData.coolTime || ''}
                onChange={(e) => handleInputChange('coolTime', e.target.value)}
                placeholder="e.g., 60"
              />
            </div>
            <div>
              <Label htmlFor="batchSize">Batch Size (items)</Label>
              <Input
                id="batchSize"
                type="number"
                min="1"
                value={formData.batchSize || ''}
                onChange={(e) => handleInputChange('batchSize', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shelfLife">Shelf Life (minutes)</Label>
            <Input
              id="shelfLife"
              type="number"
              min="1"
              value={formData.shelfLife || ''}
              onChange={(e) => handleInputChange('shelfLife', e.target.value)}
              placeholder="e.g., 1440 (24 hours)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Common values: 720 (12h), 1440 (24h), 2880 (48h)
            </p>
          </div>

          {totalTime > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Time Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                <div>Prep: {formData.prepTime}m</div>
                <div>Bake: {formData.bakeTime}m</div>
                <div>Cool: {formData.coolTime}m</div>
                <div className="font-medium">Total: {totalTime}m</div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={!isValid || loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Recipe Template'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}