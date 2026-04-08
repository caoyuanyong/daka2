import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './useAppContext';
import { ALL_PET_TYPES } from '@/constants/pets';
import { PET_LEVELS, PET_INTERACTIONS } from '@/constants/rules';
import { toast } from 'react-hot-toast';
import crypto from 'crypto';

export { ALL_PET_TYPES };

const PetContext = createContext();

export function PetProvider({ children }) {
  const { user, addPoints, isInitialized: appInitialized } = useApp();
  
  const initialPet = (typeId) => ({
    name: '我的小宠',
    typeId: typeId || 'fire_dragon',
    level: 1,
    intimacy: 0,
    fullness: 80,
    cleanliness: 90,
    mood: 85,
    isActive: typeId === 'fire_dragon'
  });

  // 1. Synchronous state initialization from localStorage to avoid ANY flickering
  // We use a simplified version because user.id might not be ready on first mount
  const [pets, setPets] = useState([]);
  const [activeTypeId, setActiveTypeId] = useState('fire_dragon');
  const [myPets, setMyPets] = useState(['fire_dragon']); 
  const [isInitialized, setIsInitialized] = useState(false);
  const [evolutionEvent, setEvolutionEvent] = useState(null);
  const prevLevelRef = React.useRef(null);

  // 2. Immediate recovery when user is available (still for flicker-free but handles user change)
  useEffect(() => {
    if (user?.id) {
      const storedType = localStorage.getItem(`last_active_type_${user.id}`);
      const storedPet = localStorage.getItem(`last_active_pet_full_${user.id}`);
      
      if (storedType) setActiveTypeId(storedType);
      if (storedPet) {
        const pet = JSON.parse(storedPet);
        setPets(prev => {
          if (!prev.find(p => p.typeId === pet.typeId)) return [pet, ...prev];
          return prev;
        });
        prevLevelRef.current = pet.level;
      }
    }
  }, [user?.id]);

  const activePet = React.useMemo(() => {
    return pets.find(p => p.typeId === activeTypeId) || initialPet(activeTypeId);
  }, [pets, activeTypeId]);

  const getLevelInfo = (intimacy) => {
    const levelInfo = [...PET_LEVELS].reverse().find(l => intimacy >= l.threshold);
    return levelInfo || PET_LEVELS[0];
  };

  const currentLevelInfo = React.useMemo(() => {
    return getLevelInfo(activePet?.intimacy || 0);
  }, [activePet?.intimacy]);

  // Handle data fetching
  useEffect(() => {
    if (appInitialized && user?.id) {
      const loadPetData = async () => {
        // Optimization: Use global initial state if available
        if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.member?.id === user.id) {
          const init = window.__INITIAL_STATE__;
          // Hydrate from init
          const hydratedPets = init.activePet ? [init.activePet] : [];
          // unlockedPets is stored in the member object as a comma-separated or JSON string
          const unlocked = init.member?.unlockedPets ? JSON.parse(init.member.unlockedPets) : ['fire_dragon'];
          
          setPets(hydratedPets);
          setMyPets(unlocked);
          
          if (init.activePet) {
            setActiveTypeId(init.activePet.typeId);
            prevLevelRef.current = init.activePet.level;
          }
          
          setIsInitialized(true);
          return;
        }

        setIsInitialized(false);
        try {
          const res = await fetch(`/api/pets?userId=${user.id}&t=${Date.now()}`);
          const data = await res.json();
          
          let dbPets = data.pets || [];
          let dbMyPets = data.unlockedPets || ['fire_dragon'];

          if (dbPets.length === 0) {
            // Migration logic if needed
            const savedPet = localStorage.getItem(`bj_pet_${user.id}`);
            if (savedPet) {
              const petToMigrate = JSON.parse(savedPet);
              await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...petToMigrate, userId: user.id, isActive: true })
              });
              dbPets = [petToMigrate];
            }
          }

          setPets(dbPets);
          setMyPets(dbMyPets);
          
          const sortedPets = [...dbPets].sort((a, b) => {
             if (a.isActive !== b.isActive) return b.isActive ? 1 : -1;
             return new Date(b.lastInteraction) - new Date(a.lastInteraction);
          });

          const active = sortedPets[0];
          if (active) {
            setActiveTypeId(active.typeId);
            prevLevelRef.current = active.level;
            // Update cache for next reload
            localStorage.setItem(`last_active_type_${user.id}`, active.typeId);
            localStorage.setItem(`last_active_pet_full_${user.id}`, JSON.stringify(active));
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Load pets error:', error);
          setIsInitialized(true);
        }
      };
      
      loadPetData();
    }
  }, [user?.id, appInitialized]);

  const lastTypeIdRef = React.useRef(activePet?.typeId);

  // Evolution detection
  useEffect(() => {
    if (isInitialized && activePet) {
      // If the pet type changed, just sync the ref and don't trigger ritual
      if (activePet.typeId !== lastTypeIdRef.current) {
        prevLevelRef.current = activePet.level;
        lastTypeIdRef.current = activePet.typeId;
        return;
      }

      // Normal evolution check
      if (prevLevelRef.current !== null && activePet.level > prevLevelRef.current) {
        setEvolutionEvent({
          typeId: activePet.typeId,
          oldLevel: prevLevelRef.current,
          newLevel: activePet.level,
          petName: activePet.name,
          gender: activePet.gender // Pass gender for correct asset selection
        });
      }
      prevLevelRef.current = activePet.level;
      lastTypeIdRef.current = activePet.typeId;
    }
  }, [activePet?.level, activePet?.typeId, isInitialized]);

  const updatePetRemote = async (updatedPet, updatedMyPets = null) => {
    if (typeof window !== 'undefined' && user?.id) {
       localStorage.setItem(`last_active_pet_full_${user.id}`, JSON.stringify(updatedPet));
       localStorage.setItem(`last_active_type_${user.id}`, updatedPet.typeId);
    }
    try {
      await fetch(`/api/pets?userId=${user.id}&typeId=${updatedPet.typeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedPet, unlockedPets: updatedMyPets || myPets })
      });
    } catch (error) {
      console.error('Update pet error:', error);
    }
  };

  const interact = async (type) => {
    if (!activePet) return false;
    const action = PET_INTERACTIONS[type];
    if (!action) return false;

    if (user.points < action.cost) {
      toast.error('星星不足');
      return false;
    }

    addPoints(-action.cost);
    
    const updatedPet = {
      ...activePet,
      fullness: Math.min(100, Math.max(0, (Number(activePet.fullness) || 0) + (action.fullness || 0))),
      cleanliness: Math.min(100, Math.max(0, (Number(activePet.cleanliness) || 0) + (action.cleanliness || 0))),
      mood: Math.min(100, Math.max(0, (Number(activePet.mood) || 0) + (action.mood || 0))),
      intimacy: (Number(activePet.intimacy) || 0) + (action.intimacy || 0)
    };
    
    updatedPet.level = getLevelInfo(updatedPet.intimacy).level;
    
    setPets(prev => prev.map(p => p.typeId === activeTypeId ? updatedPet : p));
    updatePetRemote(updatedPet);
    return true;
  };

  const switchPet = async (typeId) => {
    const petType = ALL_PET_TYPES.find(t => t.id === typeId);
    if (!petType) return;
    
    setActiveTypeId(typeId);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`last_active_type_${user.id}`, typeId);
      const targetInState = pets.find(p => p.typeId === typeId);
      if (targetInState) localStorage.setItem(`last_active_pet_full_${user.id}`, JSON.stringify(targetInState));
    }

    try {
      const targetPet = pets.find(p => p.typeId === typeId) || initialPet(typeId);
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetPet, userId: user.id, isActive: true })
      });
      if (res.ok) {
        const savedPet = await res.json();
        setPets(prev => {
          const others = prev.filter(p => p.typeId !== typeId).map(p => ({ ...p, isActive: false }));
          return [...others, savedPet];
        });
      }
    } catch (error) {
      console.error('Switch pet error:', error);
    }
  };

  const unlockPet = async (typeId, gender = 'male') => {
    const petType = ALL_PET_TYPES.find(t => t.id === typeId);
    if (!petType) return;
    if (myPets.includes(typeId)) return switchPet(typeId);

    if (user.points < petType.cost) return toast.error('星星不足');

    addPoints(-petType.cost);
    const newMyPets = [...myPets, typeId];
    setMyPets(newMyPets);
    
    const newPetData = { 
      ...initialPet(typeId), 
      name: `我的${petType.name}`, 
      isActive: true,
      gender: gender // Persistent gender choice
    };
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPetData, userId: user.id, unlockedPets: newMyPets })
      });
      if (res.ok) {
        const savedPet = await res.json();
        setPets(prev => [...prev.filter(p => p.typeId !== typeId).map(p => ({ ...p, isActive: false })), savedPet]);
        setActiveTypeId(typeId);
        localStorage.setItem(`last_active_type_${user.id}`, typeId);
        localStorage.setItem(`last_active_pet_full_${user.id}`, JSON.stringify(savedPet));
        toast.success(`成功领养了 ${petType.name}！`);
      }
    } catch (error) {
      console.error('Unlock error:', error);
    }
  };

  const renamePet = async (name) => {
    const updatedPet = { ...activePet, name };
    setPets(prev => prev.map(p => p.typeId === activeTypeId ? updatedPet : p));
    updatePetRemote(updatedPet);
  };

  return (
    <PetContext.Provider value={{
      pet: activePet, myPets, interact, renamePet, unlockPet, switchPet,
      levelName: currentLevelInfo.name, levelInfo: currentLevelInfo,
      isInitialized, evolutionEvent, clearEvolutionEvent: () => setEvolutionEvent(null)
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) throw new Error('usePet must be used within a PetProvider');
  return context;
}
