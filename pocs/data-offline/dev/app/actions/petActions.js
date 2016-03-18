export const LOAD_PETS = 'LOAD_PETS';
export const ADD_PET   =   'ADD_PET';
export const MARK_PET_AS_SYNC  = 'MARK_PET_AS_SYNC';

export class PetActions {
  constructor() {
  }

  loadPets(pets) {
    return {
      type: LOAD_PETS,
      pets : pets
    }
  }

  addPet(pet) {
    return {
      type: ADD_PET,
      pet: pet
    }
  }

  markPetAsSync(index) {
    return {
      type: MARK_PET_AS_SYNC,
      index: index
    }
  }

}
