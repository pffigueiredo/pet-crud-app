
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Plus, Heart, PawPrint } from 'lucide-react';
import type { Pet, CreatePetInput, UpdatePetInput } from '../../server/src/schema';

// Pet type options with emojis for visual appeal
const PET_TYPES = [
  { value: 'dog', label: '🐕 Dog', emoji: '🐕' },
  { value: 'cat', label: '🐱 Cat', emoji: '🐱' },
  { value: 'bird', label: '🐦 Bird', emoji: '🐦' },
  { value: 'fish', label: '🐠 Fish', emoji: '🐠' },
  { value: 'rabbit', label: '🐰 Rabbit', emoji: '🐰' },
  { value: 'hamster', label: '🐹 Hamster', emoji: '🐹' },
  { value: 'other', label: '🐾 Other', emoji: '🐾' }
];

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating pets
  const [createFormData, setCreateFormData] = useState<CreatePetInput>({
    name: '',
    type: '',
    age: 0
  });

  // Form state for editing pets
  const [editFormData, setEditFormData] = useState<Partial<UpdatePetInput>>({
    name: '',
    type: '',
    age: 0
  });

  const loadPets = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getPets.query();
      setPets(result);
    } catch (error) {
      console.error('Failed to load pets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim() || !createFormData.type || createFormData.age < 0) {
      return;
    }

    setIsLoading(true);
    try {
      const newPet = await trpc.createPet.mutate(createFormData);
      setPets((prev: Pet[]) => [...prev, newPet]);
      setCreateFormData({ name: '', type: '', age: 0 });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet || !editFormData.name?.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedPet = await trpc.updatePet.mutate({
        id: editingPet.id,
        ...editFormData
      } as UpdatePetInput);
      
      if (updatedPet) {
        setPets((prev: Pet[]) => 
          prev.map((pet: Pet) => pet.id === editingPet.id ? updatedPet : pet)
        );
      }
      
      setEditingPet(null);
      setEditFormData({ name: '', type: '', age: 0 });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = async (petId: number) => {
    setIsLoading(true);
    try {
      const success = await trpc.deletePet.mutate({ id: petId });
      if (success) {
        setPets((prev: Pet[]) => prev.filter((pet: Pet) => pet.id !== petId));
      }
    } catch (error) {
      console.error('Failed to delete pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setEditFormData({
      name: pet.name,
      type: pet.type,
      age: pet.age
    });
    setIsEditDialogOpen(true);
  };

  const getPetTypeEmoji = (type: string) => {
    const petType = PET_TYPES.find(pt => pt.value === type.toLowerCase());
    return petType?.emoji || '🐾';
  };

  const getPetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dog: 'bg-amber-100 text-amber-800',
      cat: 'bg-purple-100 text-purple-800',
      bird: 'bg-blue-100 text-blue-800',
      fish: 'bg-cyan-100 text-cyan-800',
      rabbit: 'bg-pink-100 text-pink-800',
      hamster: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase()] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PawPrint className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pet Management
            </h1>
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <p className="text-gray-600 text-lg">Manage your beloved pets with love and care</p>
        </div>

        {/* Create Pet Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add New Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">🐾 Add New Pet</DialogTitle>
                <DialogDescription className="text-center">
                  Give your new furry friend a loving home in our database
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePet} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Pet Name</Label>
                  <Input
                    id="create-name"
                    placeholder="Enter your pet's name"
                    value={createFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreatePetInput) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-type">Pet Type</Label>
                  <Select
                    value={createFormData.type}
                    onValueChange={(value: string) =>
                      setCreateFormData((prev: CreatePetInput) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map((petType) => (
                        <SelectItem key={petType.value} value={petType.value}>
                          {petType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-age">Age (years)</Label>
                  <Input
                    id="create-age"
                    type="number"
                    placeholder="Enter age"
                    value={createFormData.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreatePetInput) => ({ ...prev, age: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    max="50"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Adding Pet...' : '💕 Add Pet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Pet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">✏️ Edit Pet</DialogTitle>
              <DialogDescription className="text-center">
                Update your pet's information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditPet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Pet Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter your pet's name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdatePetInput>) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Pet Type</Label>
                <Select
                  value={editFormData.type || ''}
                  onValueChange={(value: string) =>
                    setEditFormData((prev: Partial<UpdatePetInput>) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_TYPES.map((petType) => (
                      <SelectItem key={petType.value} value={petType.value}>
                        {petType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age (years)</Label>
                <Input
                  id="edit-age"
                  type="number"
                  placeholder="Enter age"
                  value={editFormData.age || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdatePetInput>) => ({ ...prev, age: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                  max="50"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Updating Pet...' : '💕 Update Pet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pets Grid */}
        {isLoading && pets.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🐾</div>
            <p className="text-gray-500">Loading your pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Pets Yet</h2>
            <p className="text-gray-500 mb-6">Your pet family is waiting to be built!</p>
            <p className="text-sm text-gray-400">
              Note: The backend is using stub data. In a real application, pets would be stored in a database.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet: Pet) => (
              <Card key={pet.id} className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/70 backdrop-blur-sm border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{getPetTypeEmoji(pet.type)}</div>
                    <Badge className={getPetTypeColor(pet.type)}>
                      {pet.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {pet.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Added: {pet.created_at.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(pet)}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-50 text-red-600 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>💔 Say Goodbye?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <strong>{pet.name}</strong> from your pet family? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Pet</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePet(pet.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove Pet
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Note */}
        {pets.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 bg-white/50 backdrop-blur-sm rounded-lg p-3 inline-block">
              💡 Note: This app uses stub backend handlers. In production, pets would be stored in a real database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
