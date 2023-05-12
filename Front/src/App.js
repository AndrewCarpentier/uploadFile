import styles from "./App.module.scss";
import { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState(null);
  const [video, setVideo] = useState(null);

  const onImageChange = (e) => {
    if (e.target.files.length > 1) {
      setImages(e.target.files);
      setImage(null);
    } else if (e.target.files.length === 1) {
      setImage(e.target.files[0]);
      setImages(null);
    }
  };

  async function onSubmitImage(e) {
    e.preventDefault();
    const data = new FormData();
    if (image === null) {
      for (let i = 0; i < images.length; i++) {
        data.append("image", images[i]);
      }
      fetch("http://localhost:8000/images", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((json) => console.log(json));
    } else {
      data.append("image", image);
      fetch("http://localhost:8000/image", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((json) => json);
    }
  }

  const onVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  async function onSubmitVideo(e) {
    e.preventDefault();
    const data = new FormData();
    data.append("video", video);
    await fetch("http://localhost:8000/video", {
      method: "POST",
      body: data,
    });
  }

  return (
    <div className={`d-flex flex-column ${styles.appContainer}`}>
      <div>
        <div className="mb10">
          <form onSubmit={onSubmitImage}>
            <label htmlFor="image">
              Image (multiple image can be send - max 10)
            </label>
            <input
              type="file"
              id="image"
              multiple
              name="image"
              accept="image/*"
              onChange={onImageChange}
            />
            <button type="submit">Send image</button>
          </form>
        </div>
        <div>
          <form onSubmit={onSubmitVideo}>
            <label htmlFor="video">Video</label>
            <input
              type="file"
              id="video"
              name="video"
              accept="video/*"
              onChange={onVideoChange}
            />
            <button type="submit">Send video</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
