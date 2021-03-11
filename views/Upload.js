import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {Card, Divider, Image, Text} from 'react-native-elements';
import {useLocation, useMedia, useTag} from '../hooks/ApiHooks';
import {useUploadForm} from '../hooks/UploadHooks';
import {MainContext} from '../contexts/MainContext';
import {appID, employeeTAg, employerTAg} from '../utils/variables';
import LocationList from '../components/LocationList';
import GlobalStyles from '../styles/GlobalStyles';
import ListButtonElement from '../components/ListButtonElement';
import TextBoxStyles from '../styles/TextBoxStyles';
import FormTextInput from '../components/FormTextInput';
import NiceDivider from '../components/NiceDivider';
import LoadingModal from '../components/LoadingModal';

const Upload = ({navigation}) => {
  const [image, setImage] = useState(null);
  const [filetype, setFiletype] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [payMethod, setPayMethod] = useState('hourlyWage');
  const [searchBool, setSearchBool] = useState(false);
  const [search, setSearch] = useState('');

  const {update, setUpdate} = useContext(MainContext);
  const {user} = useContext(MainContext);
  const [locationArray, setLocationArray] = useState([]);
  const [location, setLocation] = useState(null);

  const {upload} = useMedia();
  const {postTag} = useTag();
  const {handleInputChange, inputs, uploadErrors, reset} = useUploadForm();
  const {searchLocation} = useLocation();

  const doUpload = async () => {
    const formData = new FormData();

    const otherData = {
      description: inputs.description.trim(),
      place_name: location.place_name,
      coordinates: location.coordinates,
      text: location.text,
      job: user.employer,
    };

    if (user.employer) {
      otherData.payMethod = payMethod;
      otherData.wage = inputs.wage.trim();
    }

    formData.append('title', inputs.title.trim());
    formData.append('description', JSON.stringify(otherData));

    const filename = image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    let type = match ? `${filetype}/${match[1]}` : filetype;
    if (type === 'image/jpg') type = 'image/jpeg';
    formData.append('file', {
      uri: image,
      name: filename,
      type: type,
    });

    try {
      setIsUploading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const resp = await upload(formData, userToken);

      if (user.employer) {
        await postTag(
          {file_id: resp.file_id, tag: appID + '_' + employerTAg},
          userToken
        );
        await postTag({file_id: resp.file_id, tag: appID}, userToken);
      } else {
        await postTag(
          {file_id: resp.file_id, tag: appID + '_' + employeeTAg},
          userToken
        );
        await postTag({file_id: resp.file_id, tag: appID}, userToken);
      }

      Alert.alert(
        'Upload',
        'File is uploaded successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setUpdate(!update);
              doReset();
              navigation.goBack();
            },
          },
        ],
        {cancelable: false}
      );
    } catch (error) {
      Alert.alert('Upload', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (search !== undefined && search.length > 2) {
      fetchLocation(search);
    } else {
      setLocationArray([]);
    }
  }, [searchBool]);

  const pickImage = async (library) => {
    let result = null;

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    };

    if (library) {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      result = await ImagePicker.launchCameraAsync(options);
    }

    if (!result.cancelled) {
      setFiletype(result.type);
      setImage(result.uri);
    }
  };

  const askReset = () => {
    Alert.alert('Confirm', 'Do you want to clear form?', [
      {text: 'Cancel'},
      {
        text: 'Clear',
        onPress: doReset,
      },
    ]);
  };

  const doReset = () => {
    setImage(null);
    setLocation(null);
    setLocationArray([]);
    setSearch('');
    reset();
  };

  const fetchLocation = async (txt) => {
    try {
      const locationArray = await searchLocation(txt);
      setLocationArray(locationArray);
    } catch (error) {
      console.error('fetch location error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingModal visible={isUploading} />
      <ScrollView contentContainerStyle={GlobalStyles.scrollView}>
        <Image
          source={
            // eslint-disable-next-line no-undef
            image ? {uri: image} : require('../assets/image_placeholder.jpg')
          }
          containerStyle={{
            width: '50%',
            height: undefined,
            aspectRatio: 1,
            justifyContent: 'flex-end',
            alignSelf: 'center',
            marginRight: 20,
            marginTop: 10,
            borderRadius: 30,
          }}
          onPress={pickImage}
        />
        <Divider style={{height: 20, backgroundColor: '#FFF0'}} />
        <View style={TextBoxStyles.box}>
          <ListButtonElement
            text="Choose image from library"
            onPress={() => pickImage(true)}
          />
          <NiceDivider
            space={0}
            style={{
              marginStart: 20,
              marginEnd: 20,
            }}
          />
          <ListButtonElement
            text="Take a picture"
            onPress={() => pickImage(false)}
          />
        </View>

        <Divider style={{height: 20, backgroundColor: '#FFF0'}} />

        <View style={[TextBoxStyles.box, TextBoxStyles.paddingBox]}>
<<<<<<< HEAD
          {user.employer ? (
            <>
              <Text
                style={[
                  {
                    color: 'white',
                    marginBottom: 30,
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                  },
                  TextBoxStyles.title,
                ]}
                h4
              >
                Information
              </Text>
              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                Job title
              </Text>
              <FormTextInput
                autoCapitalize="words"
                placeholder="Job Title"
                value={inputs.title}
                onChangeText={(txt) => handleInputChange('title', txt)}
                errorMessage={uploadErrors.title}
              />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                Summary of work tasks
              </Text>
              <FormTextInput
                placeholder="Summary Of Work"
                value={inputs.description}
                onChangeText={(txt) => handleInputChange('description', txt)}
                errorMessage={uploadErrors.description}
              />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
=======
          <Text style={[TextBoxStyles.text, TextBoxStyles.title]}>
            {user.employer ? 'Job Title' : 'Your title'}
          </Text>
          <FormTextInput
            placeholder={user.employer ? 'Job Title' : 'Your title'}
            value={inputs.title}
            onChangeText={(txt) => handleInputChange('title', txt.trimStart())}
            errorMessage={uploadErrors.title}
          />

          <Text style={[TextBoxStyles.text, TextBoxStyles.title]}>Summary</Text>
          <FormTextInput
            placeholder={
              user.employer ? 'Summary Of Work' : 'Tell about yourself'
            }
            value={inputs.description}
            onChangeText={(txt) =>
              handleInputChange('description', txt.trimStart())
            }
            errorMessage={uploadErrors.description}
          />

          {user.employer && (
            <>
              <Text style={[TextBoxStyles.text, TextBoxStyles.title]}>
>>>>>>> master
                Payment Method
              </Text>
              <NiceDivider lineHeight={0} space={5} />
              <DropDownPicker
                defaultValue="hourlyWage"
                items={[
                  {label: 'Hourly Wage', value: 'hourlyWage'},
                  {label: 'Contract Salary', value: 'contractSalary'},
                ]}
                onChangeItem={(item) => {
                  setPayMethod(item.value);
                }}
                containerStyle={styles.picker}
              />
              <NiceDivider lineHeight={0} space={10} />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                Payment
              </Text>
              <FormTextInput
                placeholder="0$"
                value={inputs.wage}
<<<<<<< HEAD
                onChangeText={(txt) => handleInputChange('wage', txt)}
              />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                The location of the workplace
              </Text>
              <FormTextInput
                placeholder="Search for location"
                onChangeText={(txt) => {
                  setSearchBool(!searchBool);
                  setSearch(txt);
                }}
                value={search}
              />
              <LocationList
                content={locationArray}
                style={styles.locationList}
                myOnPress={(loc) => setLocation(loc)}
              />
            </>
          ) : (
            <>
              <Text
                style={[
                  {
                    color: 'white',
                    marginBottom: 30,
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                  },
                  TextBoxStyles.title,
                ]}
                h4
              >
                Information
              </Text>
              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                what kind of jobs are you looking for?
              </Text>
              <FormTextInput
                autoCapitalize="words"
                placeholder="Job Title"
                value={inputs.title}
                onChangeText={(txt) => handleInputChange('title', txt)}
                errorMessage={uploadErrors.title}
              />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                Summary of your skills and expertise
              </Text>
              <FormTextInput
                placeholder="Summary Of Work"
                value={inputs.description}
                onChangeText={(txt) => handleInputChange('description', txt)}
                errorMessage={uploadErrors.description}
              />

              <Text
                style={[
                  {color: 'white', fontSize: 13, fontWeight: 'bold'},
                  TextBoxStyles.title,
                ]}
              >
                The location where you are looking for jobs
              </Text>
              <FormTextInput
                placeholder="Search for location"
                onChangeText={(txt) => {
                  setSearchBool(!searchBool);
                  setSearch(txt);
                }}
                value={search}
              />
              <LocationList
                content={locationArray}
                style={styles.locationList}
                myOnPress={(loc) => setLocation(loc)}
=======
                onChangeText={(txt) =>
                  handleInputChange('wage', txt.trimStart())
                }
                keyboardType="numeric"
>>>>>>> master
              />
            </>
          )}

          <Text style={[TextBoxStyles.text, TextBoxStyles.title]}>
            Location
          </Text>
          <FormTextInput
            placeholder="Search for location"
            onChangeText={(txt) => {
              setSearchBool(!searchBool);
              setSearch(txt);
            }}
            value={search}
            errorMessage={
              'Selected Location: ' +
              (location !== null ? location.place_name : '')
            }
            containerStyle={{marginBottom: 20}}
          />
          <LocationList
            content={locationArray}
            style={styles.locationList}
            myOnPress={(loc) => setLocation(loc)}
          />
        </View>

        <Divider style={{height: 20, backgroundColor: '#FFF0'}} />

        <View style={TextBoxStyles.box}>
          <ListButtonElement
            text={user.employer ? 'Upload job offer' : 'Upload employee notice'}
            onPress={doUpload}
            disabled={
              (uploadErrors.title !== null && user.employer) ||
              uploadErrors.description !== null ||
              image === null ||
              location === null
            }
          />
          <NiceDivider
            space={0}
            style={{
              marginStart: 20,
              marginEnd: 20,
            }}
          />
          <ListButtonElement text="Reset form" onPress={askReset} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  add: {
    alignSelf: 'flex-end',
    backgroundColor: '#0C0F0A',
    paddingStart: 3,
    borderRadius: 5,
  },
  image: {
    flex: 1,
    width: '50%',
    aspectRatio: 1,
    borderRadius: 100,
  },
  imageText: {
    flex: 2,
  },
  scrollview: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 30,
  },
  addImage: {
    flexDirection: 'row',
    padding: 20,
  },
  payment: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  locationList: {
    position: 'relative',
    top: -20,
    marginBottom: -20,
  },
});

Upload.propTypes = {
  navigation: PropTypes.object,
};

export default Upload;
