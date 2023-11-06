import React, { useState, useEffect, FC } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  Button,
  TextInput,
  Pressable,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from "buffer";
interface DataResult {
  url:string
  open:boolean
  handleClose:any

}


function dataURLtoBlob(dataURL: string): Blob {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

const ShowImageResult:FC<DataResult> = ({url,open,handleClose}) => {

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={open}
        onRequestClose={() => {
          handleClose(!open);
        }}>
        <View style={styles.centeredView}>
          <Image
              style={styles.image}
              source={url.length > 0 ? {uri:url} : require('./assets/base.jpg')}
              resizeMode="cover"
            />
                        
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => handleClose(!open)}>
            <Text style={styles.textStyle}>Hide Modal</Text>
          </Pressable>
        </View>
      </Modal>
      </View>
    )

};

const App = ( ) => {
  const [imageBase, setImageBase] = useState<any>(null);
  const [imageObjetivo, setImageObjetivo] = useState<any>(null);
  const [result ,setResult] = useState(null)
  const [show, setShow]= useState(false)

  const handleClose = () =>{
    setShow(!show)
  }
  const handleImageBaseChange = (event:any) => {
    setImageBase(Image.resolveAssetSource(event.nativeEvent.uri));
  };

  const handleImageObjetivoChange = (event:any) => {
    setImageObjetivo(Image.resolveAssetSource(event.nativeEvent.uri));
  };

  const handleSubmit = () => {
    const url = 'https://access4.faceswapper.ai/api/FaceSwapper/UploadByFile';

    const blobBase = Buffer.from(imageBase.base64,'base64')
    const blob = new Blob([blobBase]);
    const blobObjetivo = Buffer.from(imageObjetivo.base64,'base64');
    const blobB = new Blob([blobObjetivo]);


    const formData = new FormData();
    formData.append('file', blob,"image/jpeg");
    formData.append('fileother', blobB,"image/jpeg") 

    const requestOptions = {
      method: 'POST',
      body: formData,
      headers: {
        'Host': 'access4.faceswapper.ai',
        'Origin': 'https://faceswapper.ai'
      },
    };


    fetch(url, requestOptions)
    .then(response => {
      return response.json()})
    .then(data => {
      if (data.code === 200){
        const interval_id=setInterval(async () => {
          const url_status = 'https://access4.faceswapper.ai/api/FaceSwapper/CheckStatus'
          const code = data.data?.code
          const requestCheck = {
            method: 'POST',
            body: JSON.stringify({code: code}),
            headers: {
              'Host': 'access4.faceswapper.ai',
              'Origin': 'https://faceswapper.ai',
              'Content-Type': 'application/json'
            },
          }
          fetch(url_status, requestCheck)
          .then(response => response.json())
          .then(data=>{
            console.log(data,"response")
            if (data.data.status === 'success'){
              setResult(data.data.downloadUrls[0])
              setShow(true)
              clearInterval(interval_id)
            }}
          )
        },10000)
      }
    })
    .catch(error => {
      console.error('Error al realizar la solicitud:', error);
    });
  };

  return (
    <View style={styles.centeredView}>
      <Text style={styles.titleText}>Free Reface</Text>
      <View style={styles.imagePicker}>
        <Text style={styles.textStyle}>1) Select the image base:</Text>
        <TouchableOpacity
          onPress={async () => {
            let camera = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              base64:true
            });
            console.log(camera)

            if (camera){
              setImageBase(camera?.assets[0])
            }
          }}
        >
          <Image
            style={styles.image}
            source={imageBase ?? require('./assets/base.jpg')}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.imagePicker}>
      <Text  style={styles.textStyle}>2) Select de target image:</Text>
        <TouchableOpacity
          onPress={async () => {
            let camera = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              base64:true
            });
            if (camera){
              setImageObjetivo(camera?.assets[0])
            }
          }}
        >
          <Image
            style={styles.image}
            source={imageObjetivo ??  require('./assets/base.jpg')}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <Pressable
        style={[styles.button, styles.buttonClose]}
        onPress={handleSubmit}>
        <Text style={styles.textStyle}>Reface</Text>
      </Pressable>

      {
        result && <ShowImageResult 
            url={result || ''}  
            open={show} 
            handleClose={handleClose} />
      }    

    </View>
  );
};

const styles = StyleSheet.create({
  imagePicker:{
    margin:9,
  },
  titleText:{
    alignSelf:'center',
    fontFamily:'monospace',
    fontSize:42,
    color:'#2196F3',
    fontWeight:'bold',
    marginBottom:40
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderRadius: 15,

  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: '#F08080',

  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width:150,
    alignSelf: "center",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    fontSize:25,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default App;
