import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { Box, Card, Fab, Typography } from "@mui/material";
import { Stack } from '@mui/system';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

function Cropper(props) {
  const { width, height, cropperRef, onChange, defaultValue } = props;
  const [image, setImage] = useState();
  useEffect(() => {if (defaultValue) setImage(defaultValue) }, [defaultValue]);

  const inputRef = React.useRef(null);

  const handleFile = (files) => {
    // Ensure that you have a file before attempting to read it
    if (files && files[0]) {
      // Create the blob link to the file to optimize performance:
      const blob = URL.createObjectURL(files[0]);

      if (onChange) onChange();

      // Get the image type from the extension. It's the simplest way, though be careful it can lead to an incorrect result:
      setImage(blob);
    }
    // Clear the event target value to give the possibility to upload the same image:
    inputRef.current.value = '';
  }

  // handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // triggers when file is dropped
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };

  return (
    <Card variant="outlined" sx={{ width, height }}>
      <input hidden ref={inputRef} type="file" onChange={(e) => handleFile(e.target.files)} />
      {!image ?
        <Stack height="100%" direction="column" justifyContent="center" alignItems="center">
          <Typography>Drag and drop your file here or</Typography>
          <Typography>Upload a file</Typography>
          <Box sx={{ position: 'absolute', width: '100%', height: '100%' }} onClick={() => inputRef.current.click()} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} />
        </Stack> :
        <>
          <FixedCropper
            src={image}
            stencilProps={{
              handlers: false,
              lines: false,
              movable: false,
              resizable: false,
            }}
            ref={cropperRef}
            stencilSize={{ width, height }}
            imageRestriction={ImageRestriction.stencil}
          />
          <Fab size="small" color="extended" aria-label="add" sx={{ position: 'absolute', right: 0, top: 0 }} onClick={() => inputRef.current.click()}><ChangeCircleIcon /></Fab>
        </>
      }
    </Card>
  );
}

Cropper.propTypes = {
  ref: PropTypes.object,
  src: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  defaultValue: PropTypes.string,
};

export default Cropper;