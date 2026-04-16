import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProjectCardProps {
  name: string;
  location: string;
  color: string;
  progress?: number;
  image?: ImageSourcePropType;
  onAction?: () => void;
}

export default function ProjectCard({
  name,
  location,
  color,
  progress = 0,
  image,
  onAction,
}: ProjectCardProps) {
  // Extract hex from bg-[#XXX] or use a default
  const bgMap: Record<string, string> = {
    'bg-[#FFD6F3]': '#FFD6F3',
    'bg-[#E5D4FF]': '#E5D4FF',
    'bg-[#D4E5FF]': '#D4E5FF',
  };
  const bannerColor = bgMap[color] || '#FFD6F3';

  return (
    <View
      className="mb-4 overflow-hidden rounded-[20px] border border-gray-100 bg-white"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}>
      {/* Banner */}
      <View style={{ backgroundColor: bannerColor, height: 200 }}>
        {image && (
          <Image
            source={image}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
            fadeDuration={300}
          />
        )}
        {/* 3-dot menu */}
        <TouchableOpacity 
          className="absolute right-3 top-3 p-1 rounded-full bg-black/10" 
          onPress={onAction}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={image ? 'white' : '#888'} />
        </TouchableOpacity>
      </View>

      {/* Card Footer */}
      <View className="px-4 pb-4 pt-3">
        <View className="mb-1 flex-row items-center">
          <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-[#EAE8FF]">
            <Ionicons name="construct-outline" size={11} color="#7370FF" />
          </View>
          <Text className="text-[13px] font-semibold text-[#1E1E1E]">{name}</Text>
        </View>
        <Text className="mb-3 ml-7 text-[11px] text-[#A3A3A3]">{location}</Text>

        {/* Progress bar */}
        <View className="h-[5px] overflow-hidden rounded-full bg-[#F0F0F0]">
          <View
            style={{ width: `${progress}%`, backgroundColor: '#7370FF' }}
            className="h-full rounded-full"
          />
        </View>
        <Text className="mt-1 text-right text-[10px] text-[#A3A3A3]">{progress}% complete</Text>
      </View>
    </View>
  );
}
