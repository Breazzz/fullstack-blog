import React, { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import axios from "../../axios";
import { Link, useNavigate, useParams } from "react-router-dom";

export const AddPost = () => {
  const { id } = useParams()
  const isEditable = Boolean(id)

  const [value, setValue] = useState('')
  const [fields, setFields] = React.useState({
    title: '',
    imageUrl: '',
    tags: [],
    isLoading: false
  });

  const inputFileRef = useRef(null)
  const navigate = useNavigate()

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData()

      formData.append('image', event.target.files[0])

      const { data } = await axios.post('/upload', formData)

      setFields({...fields, imageUrl: data.url})
    } catch (e) {
      console.warn(e)
      alert('Ошибка при загрузке файла')
    }
  };

  const onClickRemoveImage = () => {
    setFields({...fields, imageUrl: ''})
  };

  const onChange = React.useCallback((value) => {
    setValue(value);
  }, []);

  const onSubmit = async () => {
    try {
      setFields({...fields, isLoading: true})

      const { data } = isEditable
        ? await axios.patch(`/posts/${id}`, {...fields, text: value})
        : await axios.post('/posts', {...fields, text: value})

      const _id = isEditable ? id : data._id
      navigate(`/posts/${_id}`)

      setFields({...fields, isLoading: false})
    } catch (e) {
      console.warn(e)
      alert('Ошибка публикации')
    }
  }

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );

  useEffect(() => {
    if (id) {
      axios.get(`/posts/${id}`).then(res => {
        console.log('====>res<====', res)
        setFields(res.data)
      })
    }
  }, [])

  return (
    <Paper style={{padding: 30}}>
      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Загрузить фото
      </Button>
      <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden/>
      {fields.imageUrl && (
        <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
            Удалить
          </Button>
          <img className={styles.image} src={`http://localhost:4444${fields.imageUrl}`} alt="Uploaded"/>
        </>
      )}
      <br/>
      <br/>
      <TextField
        classes={{root: styles.title}}
        onChange={e => setFields({...fields, title: e.target?.value})}
        value={fields.title}
        variant="standard"
        placeholder="Заголовок статьи..."
        fullWidth
      />
      <TextField
        onChange={e => setFields({...fields, tags: e.target?.value?.split(' ')})}
        classes={{root: styles.tags}}
        value={fields.tags.join(' ')}
        variant="standard"
        placeholder="Тэги"
        fullWidth/>
      <SimpleMDE className={styles.editor} value={value || fields.text} onChange={onChange} options={options}/>
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditable ? 'Редактировать' : 'Опубликовать'}
        </Button>
        <Link to="/">
          <Button size="large">Отмена</Button>
        </Link>
      </div>
    </Paper>
  );
};
