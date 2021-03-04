import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ListItem as RNEListItem} from 'react-native-elements';
import {TouchableOpacity} from 'react-native';
import {Alert} from 'react-native';
import {MainContext} from '../contexts/MainContext';

const LocationListItem = ({singleLocation}) => {
  const {setSelectedLocation} = useContext(MainContext);
  const {setLocationArray} = useContext(MainContext);
  const {update, setUpdate} = useContext(MainContext);

  console.log('singleLocation values', singleLocation);
  return (
    <TouchableOpacity
      onPress={() => {
        const locationData = {
          place_name: singleLocation.place_name,
          text: singleLocation.text,
          coordinates: singleLocation.center,
        };
        setSelectedLocation(locationData);
        setLocationArray([]);
        setUpdate(!update);
        Alert.alert('Location', 'Location pressed');
      }}
    >
      <RNEListItem bottomDivider>
        <RNEListItem.Content>
          <RNEListItem.Title h4>{singleLocation.place_name}</RNEListItem.Title>
        </RNEListItem.Content>
      </RNEListItem>
    </TouchableOpacity>
  );
};

LocationListItem.propTypes = {
  singleLocation: PropTypes.object,
};

export default LocationListItem;
