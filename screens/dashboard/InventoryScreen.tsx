import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';
import { getPermissions, type UserRole } from '../../constants/roles';

interface InventoryItem {
  id: number;
  item_name: string;
  category: string;
  quantity: string;
  critical_level: string;
  price: string;
  unit: string;
}

interface Props {
  projectId: number;
  onBack: () => void;
  userRole?: UserRole;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Materials: { bg: '#FFFDCF', text: '#1E1E1E' },
  Equipment: { bg: '#FFD6F3', text: '#1E1E1E' },
  Tools: { bg: '#D6F3FF', text: '#1E1E1E' },
};

function stockStatus(qty: string, critical: string): { label: string; bg: string; text: string } {
  const q = parseInt(qty) || 0;
  const c = parseInt(critical) || 0;
  if (q <= 0) return { label: 'Out of Stock', bg: '#FF6B6B', text: 'white' };
  if (q <= c) return { label: 'Low Stock', bg: '#FF7D7D', text: 'white' };
  return { label: 'In Stock', bg: '#5DBF50', text: 'white' };
}

const PREDEFINED_ITEMS = ['Cement', 'Extension Wire', 'Glass Panels', 'Welding Machine'];

export default function InventoryScreen({ projectId, onBack, userRole }: Props) {
  const perms = getPermissions(userRole);
  const canEdit = perms.canEditInventory;
  const canAdd = perms.canAddInventory;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Materials');
  const [addQty, setAddQty] = useState('');
  const [addCritical, setAddCritical] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addUnit, setAddUnit] = useState('');
  const [saving, setSaving] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // Update modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'added' | 'updated'>('added');

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/inventory?projectId=${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Inventory Fetch Error:', err);
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const handleAdd = async () => {
    if (!addName.trim()) {
      Alert.alert('Required', 'Item name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          itemName: addName,
          category: addCategory,
          quantity: `${addQty}`,
          criticalLevel: `${addCritical}`,
          price: `P${addPrice}`,
          unit: 'unit',
        }),
      });
      if (res.ok) {
        load();
        setShowAdd(false);
        setAddName('');
        setAddQty('');
        setAddCritical('');
        setAddPrice('');
        setSuccessType('added');
        setShowSuccess(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/inventory/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: editName, quantity: editQty }),
      });
      if (res.ok) {
        load();
        setEditItem(null);
        setSuccessType('updated');
        setShowSuccess(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
          load();
        },
      },
    ]);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#E7E7EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 10,
  } as const;

  const projectName = 'Project Name'; // Placeholder or could be passed as prop

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pb-4 pt-12">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="chevron-back" size={32} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-[32px] font-bold text-[#7370FF]">Inventory</Text>
      </View>

      {/* ... rest of the content ... */}


      {/* Add Button — only if role has permission (Procurement, etc.) */}
      {canAdd && (
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          className="mx-5 mb-6 h-[56px] items-center justify-center rounded-[14px] shadow-lg"
          style={{
            backgroundColor: '#7370FF',
            shadowColor: '#7370FF',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}>
          <Text className="text-[18px] font-bold text-white">Add an Item</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#7370FF" size="large" className="mt-10" />
      ) : (
        <ScrollView
          className="px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}>
          {items.map((item) => {
            const status = stockStatus(item.quantity, item.critical_level);
            const catStyle = categoryColors[item.category] || { bg: '#F0F0F0', text: '#1E1E1E' };

            return (
              <View
                key={item.id}
                className="mb-5 rounded-[24px] border border-[#F0F0F0] bg-white p-6"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 15,
                  elevation: 3,
                }}>
                <View className="mb-5 flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <Text className="mr-3 text-[20px] font-bold text-[#1E1E1E]">
                      {item.item_name}
                    </Text>
                    <View className="rounded-md px-3 py-1" style={{ backgroundColor: status.bg }}>
                      <Text className="text-[10px] font-bold uppercase text-white">
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  {canEdit && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(item.item_name, 'Choose action', [
                          {
                            text: 'Update',
                            onPress: () => {
                              setEditItem(item);
                              setEditName(item.item_name);
                              setEditQty(item.quantity);
                            },
                          },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => handleDelete(item.id),
                          },
                          { text: 'Cancel', style: 'cancel' },
                        ])
                      }>
                      <Ionicons name="ellipsis-vertical" size={20} color="#B9B9B9" />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-row justify-between">
                  <View className="items-start" style={{ width: '25%' }}>
                    <View
                      className="mb-2 rounded-md px-2.5 py-1"
                      style={{ backgroundColor: catStyle.bg }}>
                      <Text className="text-[11px] font-bold" style={{ color: catStyle.text }}>
                        {item.category}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-medium uppercase tracking-tight text-[#A3A3A3]">
                      Category
                    </Text>
                  </View>

                  <View className="items-center" style={{ width: '25%' }}>
                    <Text className="mb-2 text-[13px] font-bold text-[#1E1E1E]">
                      {item.quantity}
                    </Text>
                    <Text className="text-[10px] font-medium uppercase tracking-tight text-[#A3A3A3]">
                      In Stock
                    </Text>
                  </View>

                  <View className="items-center" style={{ width: '25%' }}>
                    <Text className="mb-2 text-[13px] font-bold text-[#1E1E1E]">
                      {item.critical_level}
                    </Text>
                    <Text className="text-[10px] font-medium uppercase tracking-tight text-[#A3A3A3]">
                      Critical Level
                    </Text>
                  </View>

                  <View className="items-end" style={{ width: '25%' }}>
                    <Text className="mb-2 text-[13px] font-bold text-[#1E1E1E]" numberOfLines={1}>
                      {item.price}
                    </Text>
                    <Text className="text-[10px] font-medium uppercase tracking-tight text-[#A3A3A3]">
                      Price
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ADD ITEM MODAL */}
      <Modal
        visible={showAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-[32px] bg-white p-6 shadow-2xl">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-1" />
              <Text className="flex-1 text-center text-[18px] font-bold text-[#7370FF]">
                Add an Item
              </Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} className="flex-1 items-end">
                <Ionicons name="close" size={24} color="#A3A3A3" />
              </TouchableOpacity>
            </View>

            <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Item Name</Text>
            <TextInput
              value={addName}
              onChangeText={setAddName}
              style={inputStyle}
              placeholder="e.g. Cement, Glass Panels..."
              placeholderTextColor="#A3A3A3"
            />
            {/* 
              In case you want the dropdown picker back in the future, here is the code:
              <TouchableOpacity
                onPress={() => setShowItemPicker(!showItemPicker)}
                style={inputStyle}
                className="flex-row items-center justify-between">
                <Text className={`text-[14px] ${addName ? 'text-[#1E1E1E]' : 'text-[#A3A3A3]'}`}>
                  {addName || 'Select item...'}
                </Text>
                <Ionicons name={showItemPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#7370FF" />
              </TouchableOpacity>

              {showItemPicker && (
                <View className="mt-1 overflow-hidden rounded-[12px] border border-[#E7E7EE] bg-white shadow-sm">
                  {PREDEFINED_ITEMS.map((item, index) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setAddName(item);
                        setShowItemPicker(false);
                      }}
                      className={`p-4 ${index !== PREDEFINED_ITEMS.length - 1 ? 'border-b border-[#F0F0F0]' : ''} ${addName === item ? 'bg-[#F9F8FF]' : ''}`}>
                      <Text className={`text-[14px] ${addName === item ? 'font-bold text-[#7370FF]' : 'text-[#1E1E1E]'}`}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => { setAddName(''); setShowItemPicker(false); }}
                    className="bg-[#F5F5F7] p-4">
                    <Text className="text-[14px] italic text-[#A3A3A3]">Reset selection...</Text>
                  </TouchableOpacity>
                </View>
              )}              THIS IS FOR THE INPUT TYPE OF ITEM NAME ON THE ADD AN ITEM INVENTORY
            */}

            <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Category</Text>
            <TextInput
              value={addCategory}
              onChangeText={setAddCategory}
              style={inputStyle}
              placeholder="Materials"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Price</Text>
            <TextInput
              value={addPrice}
              onChangeText={setAddPrice}
              style={inputStyle}
              placeholder="P100 per bag"
            />

            <View className="mb-6 flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Critical Level</Text>
                <TextInput
                  value={addCritical}
                  onChangeText={setAddCritical}
                  style={inputStyle}
                  placeholder="20 Bags"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Current Stock</Text>
                <TextInput
                  value={addQty}
                  onChangeText={setAddQty}
                  style={inputStyle}
                  placeholder="24 Bags"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving}
              className="h-[52px] items-center justify-center rounded-[14px]"
              style={{ backgroundColor: '#7370FF' }}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-bold text-white">Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* UPDATE ITEM MODAL */}
      <Modal
        visible={!!editItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditItem(null)}>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-1" />
              <Text className="flex-1 text-center text-[18px] font-bold text-[#7370FF]">
                Update an Item
              </Text>
              <TouchableOpacity onPress={() => setEditItem(null)} className="flex-1 items-end">
                <Ionicons name="close" size={24} color="#A3A3A3" />
              </TouchableOpacity>
            </View>

            <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Item Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={inputStyle}
              placeholder="Cement"
            />

            <Text className="mb-2 text-[12px] font-bold text-[#1E1E1E]">Current Stock</Text>
            <TextInput
              value={editQty}
              onChangeText={setEditQty}
              style={inputStyle}
              placeholder="20 Bags"
            />

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              className="mt-4 h-[52px] items-center justify-center rounded-[14px]"
              style={{ backgroundColor: '#7370FF' }}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-bold text-white">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="w-full max-w-sm items-center rounded-[32px] bg-white p-10 shadow-2xl">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#7370FF] shadow-lg shadow-[#7370FF]/40">
              <Ionicons name="checkmark" size={60} color="white" />
            </View>

            <Text className="mb-3 text-[20px] font-bold text-[#1E1E1E]">
              Item {successType === 'added' ? 'added!' : 'updated!'}
            </Text>

            <Text className="mb-10 text-center text-[14px] leading-5 text-[#A3A3A3]">
              {successType === 'added'
                ? `Item is now visible to ${projectName}'s inventory.`
                : 'This item is now updated.'}
            </Text>

            <TouchableOpacity
              onPress={() => setShowSuccess(false)}
              className="h-[52px] w-full items-center justify-center rounded-[14px]"
              style={{ backgroundColor: '#7370FF' }}>
              <Text className="text-[16px] font-bold text-white">Back to inventory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
