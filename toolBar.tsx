import { ImageBackground, Text, TouchableOpacity, View, Modal, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
export const backgroundImage = require('../../assets/images/background/mainBG.png');
import tailwindConfig from '@/tailwind.config';
import { useNavigation, ParamListBase, NavigationProp } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { useCallback, useEffect, useState } from 'react';
import LogoShaper from '../../assets/images/logo/bog_logo_shape.svg';
import { Ionicons } from '@expo/vector-icons';
import { Biometric } from '@/model/BiometricDTO';
import uuid from 'react-native-uuid';
import * as Device from 'expo-device';
import BiomatricServices from '@/services/biometricServices';
import { DialogMessageProps } from '@/model/MessageModalDTO';
import { DialogMessageTypes } from '@/model/enum/DialogType';
import DialogMessage from '../core/DialogMessage';
import AppLoader from '../core/appLoader';
import tokenService from '@/services/general/helper';
import { getUniqueId } from '@/services/general/uniqueIdentifier';

interface ToolBarParam {
  title?: any;
  isBack?: boolean;
}

export default function ToolBar(props: ToolBarParam) {
  // const navigation = useNavigation();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);
  const [dialogMessageData, setDialogMessageData] = useState<DialogMessageProps>();
  const [isLoading, setIsloading] = useState<Boolean>();
  const [biomatricToken, setBiomatricToken] = useState<string>();

  useEffect(() => {
    getTokenBiomatric();
  }, []);
  async function getTokenBiomatric() {
    let biomatricToken = await tokenService.getBiomatric();
    if (biomatricToken) {
      setBiomatricToken(biomatricToken);
    }
  }

  function handleBackButtonClick() {
    navigation.goBack();
    // props.navigation.goBack();
    return true;
  }
  function OpenBioMetric() {
    setExpanded(true);
  }

  const addBiomatric = async () => {
    let UniqeValue = '';
    await getUniqueId().then((id) => {
      UniqeValue = id;
      console.log('Device Unique ID:', id);
    });
    setIsloading(true);
    let BiometricData: Biometric = {
      FCMToken: '',
      identifier: UniqeValue + '',
      model: Device.modelName + '',
      osVersion: Device.osVersion + '',
      platform: Platform.OS,
    };
    console.log(BiometricData);
    BiomatricServices.AddBiometric(BiometricData)
      .then((res) => {
        setIsloading(false);
        if (res.data.statusCode == 200) {
          tokenService.setBiomatric(res.data.result);
          setBiomatricToken(res.data.result);
          setExpanded(false);
          setDialogMessageData({
            isVisable: true,
            desc: 'تم التفعيل بنجاح',
            type: DialogMessageTypes.SUCCESS,
            navigation: navigation,
            isBackToHome: true,
          });
        } else {
          setDialogMessageData({
            isVisable: true,
            desc: res.data.message,
            type: DialogMessageTypes.WARNING,
            navigation: navigation,
          });
        }
        setIsloading(false);
      })
      .catch((e) => {
        setIsloading(false);
      });
    console.log('Add', navigation.getState().index);
  };
  const callBackModal = (value: boolean) => {
    setDialogMessageData({ isVisable: value });
  };
  return (
    <View>
      <DialogMessage
        desc={dialogMessageData?.desc}
        navigation={dialogMessageData?.navigation}
        errorStatus={dialogMessageData?.errorStatus}
        callBackModal={callBackModal}
        isVisable={dialogMessageData?.isVisable ? dialogMessageData.isVisable : false}
        type={dialogMessageData?.type}
        isBackToHome={dialogMessageData?.isBackToHome}
      />
      <View className="bg-primary mt-10">
        <ImageBackground source={backgroundImage} resizeMode="cover">
          <View className="m-0 p-2.5 w-full flex-row-reverse h-14 rounded-b-3xl bg-primary/50">
            <Text className="font-cairoBold text-white text-lg self-center text-right w-[80%]">{props?.title}</Text>
            <TouchableOpacity className="self-center flex-row w-[20%]">
              {props.isBack ? (
                <TouchableOpacity onPress={handleBackButtonClick}>
                  <MaterialCommunityIcons name="arrow-left-thick" size={30} color="white" />
                </TouchableOpacity>
              ) : (
                <View className="flex-row space-x-4">
                  <TouchableOpacity onPress={handleBackButtonClick}>
                    <MaterialCommunityIcons name="bell-badge-outline" size={30} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={OpenBioMetric}>
                    {biomatricToken != '' && biomatricToken != null ? (
                      <Ionicons name="finger-print" size={30} color={tailwindConfig?.theme?.extend?.colors?.white} />
                    ) : (
                      <MaterialCommunityIcons name="fingerprint-off" size={30} color={tailwindConfig?.theme?.extend?.colors?.white} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      {expanded ? (
        <Modal visible={expanded} statusBarTranslucent={true} transparent={true} animationType="slide" onRequestClose={() => setExpanded(false)}>
          {isLoading ? <AppLoader /> : <></>}
          <View className="items-center w-full h-full bg-black/50 ">
            <View className="w-[90%]  rounded-t-lg absolute bottom-0 ">
              <View className="z-10 w-full items-center flex-row justify-center bg-transparent mb-[-20%]">
                <Animatable.View delay={500} animation="zoomInDown" className="w-40 h-40 items-center p-3 bg-white rounded-full">
                  <LogoShaper />
                </Animatable.View>
              </View>
              <View className="h-fit bg-white pt-[25%] rounded-t-lg">
                <Text className="font-cairoBold text-center text-base p-2 text-primary">هل ترغب في تسجيل الدخول بإستخدام البصمة / معرف الوجه في المره القادمة؟</Text>
                <TouchableOpacity onPress={addBiomatric} className="flex-row mt-4 justify-end items-center p-4 border-primary border-y-[1px] bg-primary/10">
                  <Text className="font-cairoBold text-lg mr-4">نعم</Text>
                  <Ionicons name="finger-print-sharp" size={30} color={tailwindConfig?.theme?.extend?.colors?.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setExpanded(false)} className="flex-row justify-end items-center p-4 border-primary border-b-[1px] bg-primary/10">
                  <Text className="font-cairoBold text-lg mr-4">لا</Text>
                  <MaterialCommunityIcons name="fingerprint-off" size={30} color={tailwindConfig?.theme?.extend?.colors?.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setExpanded(false)} className="flex-row justify-end items-center p-4 border-primary bg-primary/10">
                  <Text className="font-cairoBold text-lg mr-4">ذكرني لاحقا</Text>
                  <MaterialCommunityIcons name="clock-time-one-outline" size={30} color={tailwindConfig?.theme?.extend?.colors?.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* </View> */}
        </Modal>
      ) : null}
    </View>
  );
}
