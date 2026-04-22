import defaultImage from '@/assets/images/pb/default-image.png';
import React from 'react';
import { Image } from 'react-native';

interface ImageProfileProps {
    width: number;
    height: number;
    src: string | null;
}

const ImageProfile = ({ width, height, src }: ImageProfileProps) => {

    return (
        <Image
            style={{
                width,
                height,
                borderRadius: 100,
            }}
            source={src ? { uri: src } : defaultImage}
        />
    );
}

export default ImageProfile;