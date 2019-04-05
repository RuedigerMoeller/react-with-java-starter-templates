import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import ReactCrop,{makeAspectCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {Button,Image as SemImage,Label,Modal} from 'semantic-ui-react';
import {BaseTextField} from "./basetextfield";
import {App} from "../../app/app";
import {FlexCol, FlexRow, Gap} from "./layout";
import {Store} from "../basestore";

export class ImageUpload extends BaseTextField {

  static getDid() { return "imageURL" };
  static getDefault() { return "" };
  static getIcon() { return null; };
  static getLabel() { return "Bild" };
  static getValidationText() { return "Click zum Editieren" };

  constructor(p) {
    super(p);
    this.state.modalOpen = false;
  }

  editImg() {
    this.setState({modalOpen: true});
  }

  uploaded(imageId) {
    console.log("uploaded",imageId);
    this.setValue( "./imgupload/"+imageId );
    this.setState({modalOpen: false});
  }

  getValue() {
    return this.state.value;
  }

  createControl(newProps) {
    const disabled = newProps.disabled;
    let label = null;
    if ( this.props.showLabel ) {
      // white is an invalid color, need to copy paste full label
      label=this.isValid() ? <Label basic pointing='left'>{this.getLabel()}</Label> : <Label color={'red'} basic pointing='left'>{this.getLabel()}</Label>;
    }
    return <FlexRow key={this.getDid()} alignCenter>
      <Modal open={this.state.modalOpen}
             closeOnDimmerClick={true}
             onClose={ ev=> this.setState({modalOpen:false})}
             size={'large'}
      >
        <ImageEdit onValue={imageId => this.uploaded(imageId)}/>
      </Modal>
      <div>
        {this.state.value ?
          <SemImage src={this.state.value} style={{ width: 60, height: 60, cursor: 'pointer'}} onClick={e=>this.editImg()}/> :
          <div style={{width: 60, height: 60, background: "#eee", cursor: 'pointer'}} onClick={e=>this.editImg()}></div>
        }
      </div>
      <div>{label}</div>
    </FlexRow>
  }
}

class ImageEdit extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      imagesrc: null,
      crop: null, // the cropping clip
      imageId: null, //
      valid: false
    };
  }

  /**
   * callback for crop changes
   * @param crop
   */
  imageChanged(crop) {
    this.setState({ crop: crop, imageId: null });
  }

  /**
   *
   * @param files
   */
  onDrop(files){
    const reader  = new FileReader();
    const image = new Image();
    image.onload  = ()=>this.onImageLoaded(image);
    reader.onloadend = () => image.src = reader.result;
    reader.readAsDataURL(files[0]);
  }

  onImageLoaded(image){
    if ( !image || (!image.naturalWidth  && !image.naturalHeight) )
      return;
    // calc the predefined crop area (in percent)
    let ratio = image.naturalWidth / image.naturalHeight;

    let cw = 40; // initial crop size
    let ch = ratio * cw;
    image.width = 900;
    image.height = 900/ratio;
    if ( image.height > 800 ) {
      image.width = 800*ratio;
      image.height = 800;
    }

    this.setState({
      imagesrc:image.src,
      currentImage: image,
      crop:{
        x:5,
        y:5,
        width: cw,
        height: ch,
        aspect: 1,
      }
    });
  }

  savable(){
    return this.state.currentImage && !this.state.imageId;
  }

  onDelete(){
    this.setState({imagesrc: null, imageId:null, currentImage: null});
  }

  render() {
    return <FlexCol style={{ height: 1024}}>
      <Gap/>
      <h3 align="center">Bild hochladen</h3>
      <Gap/>
      <FlexRow style={{flex: 1}} justifyCenter alignCenter>{ this.state.imagesrc ? this.renderPreview() : this.renderDropzone()}</FlexRow>
      <FlexRow justifyCenter m8>
        <Gap/>
        <Button size={'large'} disabled={!this.state.currentImage } onClick={()=> this.onDelete() }>Zurücksetzen</Button>
        <Gap small/>
        <Button size={'large'} primary disabled={!this.savable()} onClick={()=> this.onSave() }>Auswählen</Button>
      </FlexRow>
      <Gap large/>
    </FlexCol>
  }

  renderDropzone(){
    return <Dropzone
      style={{border:'1px dashed lightgrey',borderRadius:'5px', width: "100%", height: "100%", margin: 8}}
      accept="image/png,image/jpeg"
      onDrop={(files)=> this.onDrop(files)}
    >
      <FlexCol justifyCenter alignCenter style={{ cursor: 'pointer', width: '100%', height: '100%' }}>
        <div>Click oder drop Image</div>
      </FlexCol>
    </Dropzone>;
  }

  renderPreview() {
    return <ReactCrop
      crop={this.state.crop}
      src={this.state.imagesrc}
      onChange={(crop)=> this.imageChanged(crop)}
      onImageLoaded={(image)=>this.onImageLoaded(image)}
    />
  }

  onSave(){
    if( this.state.currentImage )
    {
      const croppedBase64 = this.getCroppedImg(this.state.currentImage, this.state.crop);
      Store().uploadImage(croppedBase64, 'image/jpeg').then( (result) => {
        this.setState({
          imageId: result,
        }, () => {
          if( this.props.onValue )
          {
            this.props.onValue(this.state.imageId,result);
          }
        });
        App().toast("Bild hochgeladen.","success")
      }).catch( (error) => {
        console.error("uploadImage", error );
        App().toast("Bild konnte nicht gespeichert werden","error");
      });
    }

  }

  /**
   * create the cropped image and return as base64 String
   */
  getCroppedImg(image, pixelCrop) {
    const canvas = document.createElement('canvas');
    let x=0,y=0,width=0,height=0;
    const currentImage = this.state.currentImage;
    if( pixelCrop )
    {
      canvas.width = image.naturalWidth/100 * pixelCrop.width;
      canvas.height = image.naturalHeight/100 * pixelCrop.height;
      x = currentImage.naturalWidth/100 * pixelCrop.x;
      y = currentImage.naturalHeight/100 * pixelCrop.y;
      width = currentImage.naturalWidth/100 * pixelCrop.width;
      height = currentImage.naturalHeight/100 * pixelCrop.height;
    } else {
      x = y = 0;
      width = currentImage.naturalWidth;
      height = currentImage.naturalHeight;
      canvas.width = width;
      canvas.height = height;
    }
    canvas.getContext('2d').drawImage( image, x, y, width, height, 0, 0, width, height );
    return canvas.toDataURL('image/jpeg');
  }

}
