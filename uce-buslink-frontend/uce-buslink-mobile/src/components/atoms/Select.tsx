import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ value, options, onChange, placeholder = 'Seleccionar', className = '' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl ${className}`}
      >
        <Text className={`text-sm ${selected ? 'text-navy-900' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color="#9ca3af" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-8" onPress={() => setOpen(false)}>
          <Pressable className="bg-white rounded-2xl overflow-hidden" onPress={() => {}}>
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => { onChange(opt.value); setOpen(false); }}
                  className="flex-row items-center justify-between px-5 py-3.5 border-b border-gray-50"
                >
                  <Text className={`text-sm ${active ? 'text-navy-900 font-semibold' : 'text-gray-600'}`}>{opt.label}</Text>
                  {active && <Check size={16} color="#0a1628" />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
