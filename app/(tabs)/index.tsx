import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, Alert, StyleSheet } from 'react-native';
import { Provider as PaperProvider, TextInput, Button, List, IconButton, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: Date | null;
};

const HomeScreen = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Escuela');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (title && description && category && dueDate) {
      if (editTaskId) {
        setTasks(tasks.map(t => (t.id === editTaskId ? { ...t, title, description, category, dueDate } : t)));
        setEditTaskId(null);
      } else {
        setTasks([...tasks, { id: Date.now().toString(), title, description, category, dueDate }]);
      }
      setTitle('');
      setDescription('');
      setCategory('Escuela');
      setDueDate(null);
    } else {
      Alert.alert("Error", "Por favor, complete todos los campos.");
    }
  };

  const deleteTask = (id: string) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => setTasks(tasks.filter(task => task.id !== id)) }
      ]
    );
  };

  const editTask = (id: string) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate);
      setEditTaskId(taskToEdit.id);
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View>
      <List.Item
        title={item.title}
        description={item.description}
        right={() => (
          <View style={styles.buttonContainer}>
            <IconButton icon="pencil" onPress={() => editTask(item.id)} />
            <IconButton icon="delete" onPress={() => deleteTask(item.id)} />
          </View>
        )}
      />
      <Divider />
    </View>
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <TextInput
          mode="outlined"
          label="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <Picker
          selectedValue={category}
          onValueChange={value => setCategory(value)}
          style={styles.picker}
        >
          <Picker.Item label="Escuela" value="Escuela" />
          <Picker.Item label="Hogar" value="Hogar" />
          <Picker.Item label="Trabajo" value="Trabajo" />
          <Picker.Item label="Relaciones" value="Relaciones" />
        </Picker>
        <Button onPress={() => setShowDatePicker(true)} mode="outlined" style={styles.dateButton}>
          {dueDate ? `Fecha Límite: ${dueDate.toLocaleDateString()}` : "Seleccionar Fecha Límite"}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date);
            }}
          />
        )}
        <Button mode="contained" onPress={addTask} style={styles.addButton}>
          {editTaskId ? "Actualizar" : "Agregar"}
        </Button>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 10,
  },
  dateButton: {
    marginBottom: 10,
  },
  picker: {
    marginBottom: 10,
  },
  addButton: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
