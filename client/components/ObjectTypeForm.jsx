/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import FieldForm from './FieldForm';
import FieldItem from './FieldItem';
import { ObjectContext } from './ObjectContextProvider';
import UpdateForm from './UpdateForm';

function ObjectTypeForm() {
  // Gives us access to global state
  const [
    objectListState,
    setObjectList,
    nodeObj,
    setNodeObj,
    viewCode,
    setViewCode,
  ] = useContext(ObjectContext);
  // Fields is an array of objects with fieldName and fieldType properties
  const [fields, setFields] = useState([]);
  // objectName keeps track of current object type name in form
  const [objectName, setObjectName] = useState('');
  // usedDuplicateFields notifies user if they tried to use an existing field or objectName
  const [usedDuplicateFields, setUsedDuplicateFields] = useState(false);
  // State that keeps track of new field in fieldForm
  const defaultField = {
    fieldName: '',
    fieldType: 'GraphQLString',
    hasRelation: false,
    relatedObjectName: null,
    relatedObjectField: null,
    relatedReferenceType: null,
  };
  const [newField, setNewField] = useState(defaultField);

  // Adds new object to global state
  const addObject = (e) => {
    e.preventDefault();
    // Check if duplicate object name was used
    setUsedDuplicateFields(false);
    // If user forgets to add fields, alert them
    if (!fields[0]) {
      // eslint-disable-next-line no-alert
      alert(`Please enter at least one field in ${objectName}.`);
      return;
    }
    // Check for duplicates after create is clicked
    const duplicateObject = checkDuplicates({ objectName, fields });
    // If there are duplicates, warn user
    if (duplicateObject) {
      setUsedDuplicateFields(true);
      return;
    }
    // Push new object to object list
    const newObjectList = [...objectListState.objects, { objectName, fields }];
    // Add new object list to the objects property of our object list global state
    const stateObject = { ...objectListState, objects: newObjectList };
    setObjectList(stateObject);
    // Clear out local state fields
    setFields([]);
    // clear out objectType input
    setObjectName('');
    // Clear out new field in case user forgets to press plus
    setNewField({ ...defaultField });
  };
  // Allows users to update current fieldName or type
  const updateFieldName = (inputValue, index) => {
    const newFields = [...fields];
    newFields[index].fieldName = inputValue;
    setUsedDuplicateFields(false);
    setFields([...newFields]);
  };
  // Lets users change the graphQL type
  const updateFieldType = (inputType, index) => {
    const newFields = [...fields];
    newFields[index].fieldType = inputType;
    setFields([...newFields]);
  };
  // Lets users determine whether a field has relations
  const updateHasRelation = (inputRelation, index) => {
    const newFields = [...fields];
    newFields[index].hasRelation = inputRelation;
    setFields([...newFields]);
  };
  // Lets users add relationships to other object types
  const updateObjectRelation = (inputObjType, index) => {
    const newFields = [...fields];
    newFields[index].relatedObjectName = inputObjType;
    setFields([...newFields]);
  };
  // Lets users specify the related field
  const updateFieldRelation = (inputFieldType, index) => {
    const newFields = [...fields];
    newFields[index].relatedObjectField = inputFieldType;
    setFields([...newFields]);
  };
  // Allows users to add new field
  const addField = (fieldItemInput, e) => {
    setFields([...fields, fieldItemInput]);
    e.preventDefault();
  };
  // Allows users to delete fields
  const deleteField = (fieldIndex, e) => {
    e.preventDefault();
    setUsedDuplicateFields(false);
    const newFields = fields.filter((field, index) => index !== fieldIndex);
    setFields([...newFields]);
  };
  // Function to check if newly added object has duplicate name or fields
  const checkDuplicates = (newObject) => {
    // Create object to store global object and field names
    const names = {};
    // Check duplicates in global state
    for (let i = 0; i < objectListState.objects.length; i += 1) {
      // if objectName not in names, put in names
      names[objectListState.objects[i].objectName] = true;
      for (let j = 0; j < objectListState.objects[i].fields.length; j += 1) {
        // if fieldName not in names, put in names
        names[objectListState.objects[i].fields[j].fieldName] = true;
      }
    }
    // If the new object's object name is in global state, return true
    if (names[newObject.objectName]) {
      return true;
    }
    names[newObject.objectName] = true;
    // If any of the fields are in global state, return true
    for (let w = 0; w < newObject.fields.length; w += 1) {
      if (names[newObject.fields[w].fieldName]) return true;
      names[newObject.fields[w].fieldName] = true;
    }
    // Else return false
    return false;
  };

  // Renders a number of field items
  const fieldArray = fields.map((field, index) => (
    <FieldItem
      key={index}
      ind={index}
      info={field}
      updateFieldName={updateFieldName}
      updateFieldType={updateFieldType}
      deleteField={deleteField}
      updateFieldRelation={updateFieldRelation}
      updateObjectRelation={updateObjectRelation}
      updateHasRelation={updateHasRelation}
    />
  ));
  // Check if user recently clicked a node on the graph
  if (!nodeObj.objectName && nodeObj.objectName !== '') {
    return (
      <div className="object-form mx-2">
        <Form>
          <Form.Group>
            <Form.Row className="row justify-content-between">
              <div className="item-invisible">Invisible</div>
              <Form.Label>
                <h4>Create Object</h4>
              </Form.Label>
              <Form.Check
                type="switch"
                id="custom-switch"
                className="ml-auto mr-1 mt-1"
                label={objectListState.databaseChoice}
                checked={objectListState.databaseChoice === 'MongoDB'}
                onChange={
                  (e) => (e.target.checked
                    ? setObjectList({ ...objectListState, databaseChoice: 'MongoDB' })
                    : setObjectList({ ...objectListState, databaseChoice: 'PostgreSQL' }))
                }
              />
            </Form.Row>
            <Form.Row className="row justify-content-center">
              <Form.Control
                className="row justify-content-center"
                size="sm"
                type="text"
                placeholder="Name"
                id="object-name"
                style={{ width: 'auto' }}
                value={objectName}
                onChange={(e) => {
                  setObjectName(e.target.value);
                  setUsedDuplicateFields(false);
                }}
              />
            </Form.Row>
          </Form.Group>
        </Form>
        {fieldArray}
        <FieldForm
          addField={addField}
          usedDuplicateFields={usedDuplicateFields}
          newField={newField}
          setNewField={setNewField}
          defaultField={defaultField}
        />
        <div className="row justify-content-center">
          <Button size="sm" variant="primary" type="submit" disabled={usedDuplicateFields} onClick={addObject}>
            Create Object
          </Button>
        </div>
      </div>
    );
  }
  return <UpdateForm />;
}

export default ObjectTypeForm;
