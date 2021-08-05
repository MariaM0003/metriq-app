import axios from 'axios'
import React from 'react'
import config from './../config'
import Table from 'rc-table'
import ErrorHandler from './../components/ErrorHandler'
import EditButton from '../components/EditButton'
import FormFieldRow from '../components/FormFieldRow'
import FormFieldSelectRow from '../components/FormFieldSelectRow'
import FormFieldTypeaheadRow from '../components/FormFieldTypeaheadRow'
import { Accordion, Button, Card, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(faThumbsUp, faGithub, faPlus, faTrash)

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const metricNameRegex = /.{1,}/
const methodNameRegex = /.{1,}/
const taskNameRegex = /.{1,}/
const tagNameRegex = /.{1,}/
const metricValueRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/

class Submission extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isRequestFailed: false,
      requestFailedMessage: '',
      item: { upvotes: 0, tags: [], tasks: [], methods: [], results: [] },
      metricNames: [],
      methodNames: [],
      taskNames: [],
      tagNames: [],
      showAddModal: false,
      showRemoveModal: false,
      modalMode: '',
      result: {
        task: '',
        method: '',
        metricName: '',
        metricValue: 0,
        isHigherBetter: false,
        evaluatedDate: new Date()
      },
      task: {
        name: '',
        parentTask: '',
        description: '',
        submissions: this.props.match.params.id
      },
      method: {
        name: '',
        fullName: '',
        submissions: this.props.match.params.id
      },
      taskId: '',
      methodId: '',
      tag: ''
    }

    this.handleUpVoteOnClick = this.handleUpVoteOnClick.bind(this)
    this.handleOnClickAdd = this.handleOnClickAdd.bind(this)
    this.handleOnClickRemove = this.handleOnClickRemove.bind(this)
    this.handleHideAddModal = this.handleHideAddModal.bind(this)
    this.handleHideRemoveModal = this.handleHideRemoveModal.bind(this)
    this.handleAddModalSubmit = this.handleAddModalSubmit.bind(this)
    this.handleRemoveModalDone = this.handleRemoveModalDone.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleOnTaskRemove = this.handleOnTaskRemove.bind(this)
    this.handleOnMethodRemove = this.handleOnMethodRemove.bind(this)
    this.handleOnResultRemove = this.handleOnResultRemove.bind(this)
    this.handleOnTagRemove = this.handleOnTagRemove.bind(this)
    this.handleOnSubmitTask = this.handleOnSubmitTask.bind(this)
    this.handleOnSubmitMethod = this.handleOnSubmitMethod.bind(this)
  }

  handleOnSubmitTask () {
    /* TODO */
  }

  handleOnSubmitMethod () {
    /* TODO */
  }

  handleOnChange (key1, key2, value) {
    if (key1) {
      const k1 = this.state[key1]
      k1[key2] = value
      this.setState({ [key1]: k1 })
    } else {
      this.setState({ [key2]: value })
    }
  }

  handleOnTaskRemove (taskId) {
    if (!window.confirm('Are you sure you want to remove this task from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/task/' + taskId)
        .then(res => {
          this.setState({ item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      window.location = '/Login'
    }
  }

  handleOnMethodRemove (methodId) {
    if (!window.confirm('Are you sure you want to remove this method from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/method/' + methodId)
        .then(res => {
          this.setState({ item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      window.location = '/Login'
    }
  }

  handleOnResultRemove (resultId) {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/result/' + resultId)
        .then(res => {
          const results = this.state.item.results
          for (let i = 0; i < results.length; i++) {
            if (results[i]._id === resultId) {
              results.splice(i, 1)
              break
            }
          }
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      window.location = '/Login'
    }
  }

  handleOnTagRemove (tagName) {
    if (!window.confirm('Are you sure you want to remove this tag from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/tag/' + tagName)
        .then(res => {
          this.setState({ item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      window.location = '/Login'
    }
  }

  handleUpVoteOnClick (event) {
    if (this.props.isLoggedIn) {
      axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/upvote', {})
        .then(res => {
          this.setState({ item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      window.location = '/Login'
    }
    event.preventDefault()
  }

  handleOnClickAdd (mode) {
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    this.setState({ showAddModal: true, modalMode: mode })
  }

  handleOnClickRemove (mode) {
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    this.setState({ showRemoveModal: true, modalMode: mode })
  }

  handleHideAddModal () {
    this.setState({ showAddModal: false })
  }

  handleHideRemoveModal () {
    this.setState({ showRemoveModal: false })
  }

  handleAddModalSubmit () {
    if (!this.props.isLoggedIn) {
      window.location = '/Login'
    }

    if (this.state.modalMode === 'Task') {
      axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/task/' + this.state.taskId, {})
        .then(res => {
          this.setState({ isRequestFailed: false, requestFailedMessage: '', item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else if (this.state.modalMode === 'Method') {
      axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/method/' + this.state.methodId, {})
        .then(res => {
          this.setState({ isRequestFailed: false, requestFailedMessage: '', item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else if (this.state.modalMode === 'Result') {
      const result = this.state.result
      if (!result.task) {
        result.task = this.state.item.tasks[0]._id
      }
      if (!result.method) {
        result.method = this.state.item.methods[0]._id
      }
      console.log(result)
      if (!result.metricName) {
        window.alert('Error: Metric Name cannot be blank.')
      }
      if (!result.metricValue) {
        window.alert('Error: Metric Value cannot be blank.')
      }
      if (!result.evaluatedDate) {
        result.evaluatedDate = new Date()
      }
      const resultRoute = config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/result'
      axios.post(resultRoute, result)
        .then(res => {
          this.setState({ isRequestFailed: false, requestFailedMessage: '', item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else if (this.state.modalMode === 'Tag') {
      axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/tag/' + this.state.tag, {})
        .then(res => {
          this.setState({ isRequestFailed: false, requestFailedMessage: '', item: res.data.data })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    }

    this.setState({ showAddModal: false })
  }

  handleRemoveModalDone () {
    this.setState({ showRemoveModal: false })
  }

  componentDidMount () {
    const submissionRoute = config.api.getUriPrefix() + '/submission/' + this.props.match.params.id
    axios.get(submissionRoute)
      .then(res => {
        this.setState({ isRequestFailed: false, requestFailedMessage: '', item: res.data.data })
      })
      .catch(err => {
        this.setState({ isRequestFailed: true, requestFailedMessage: ErrorHandler(err) })
      })
    const metricNamesRoute = config.api.getUriPrefix() + '/method/names'
    axios.get(metricNamesRoute)
      .then(res => {
        const data = res.data.data
        let defMethod = ''
        if (data.length) {
          defMethod = data[0]._id
        }
        this.setState({ isRequestFailed: false, requestFailedMessage: '', methodNames: data, methodId: defMethod })
      })
      .catch(err => {
        this.setState({ isRequestFailed: true, requestFailedMessage: ErrorHandler(err) })
      })
    const taskNamesRoute = config.api.getUriPrefix() + '/task/names'
    axios.get(taskNamesRoute)
      .then(res => {
        const data = res.data.data
        let defTask = ''
        if (data.length) {
          defTask = data[0]._id
        }
        this.setState({ isRequestFailed: false, requestFailedMessage: '', taskNames: data, taskId: defTask })
      })
      .catch(err => {
        this.setState({ isRequestFailed: true, requestFailedMessage: ErrorHandler(err) })
      })
    const tagNamesRoute = config.api.getUriPrefix() + '/tag/names'
    axios.get(tagNamesRoute)
      .then(res => {
        this.setState({ isRequestFailed: false, requestFailedMessage: '', tagNames: res.data.data })
      })
      .catch(err => {
        this.setState({ isRequestFailed: true, requestFailedMessage: ErrorHandler(err) })
      })
  }

  render () {
    return (
      <div className='container submission-detail-container'>
        <header>{this.state.item.name}</header>
        <br />
        <div className='row'>
          <div className='col-md-12'>
            <div><h1>{this.state.item.submissionName}</h1></div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <div className='submission-description'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec commodo est. Nunc mollis nunc ac ante vestibulum, eu consectetur magna porttitor. Proin ac tortor urna. Aliquam ac ante eu nunc aliquam convallis et in sem. Donec volutpat tincidunt tincidunt. Aliquam at risus non diam imperdiet vestibulum eget a orci. In ultricies, arcu vel semper lobortis, lorem orci placerat nisi, id fermentum purus odio ut nulla. Duis quis felis a erat mattis venenatis id sit amet purus. Aenean a risus dui.
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <button className='submission-button btn btn-secondary' onClick={this.handleUpVoteOnClick}><FontAwesomeIcon icon='thumbs-up' /> {this.state.item.upvotes.length}</button>
            <button className='submission-button btn btn-secondary'><FontAwesomeIcon icon={['fab', 'github']} /></button>
          </div>
        </div>
        <br />
        <div className='row'>
          <div className='col-md-6'>
            <div>
              <h2>Tasks
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Task')}
                  onClickRemove={() => this.handleOnClickRemove('Task')}
                />
              </h2>
              <hr />
            </div>
            {(this.state.item.tasks.length > 0) &&
              <Table
                columns={[{
                  title: 'Task',
                  dataIndex: 'name',
                  key: 'name',
                  width: 700
                }]}
                data={this.state.item.tasks.map(row =>
                  ({
                    key: row._id,
                    name: row.name
                  }))}
                onRow={(record) => ({
                  onClick () { window.location = '/Task/' + record.key }
                })}
                tableLayout='auto'
                rowClassName='index-table-link'
                showHeader={false}
              />}
            {(this.state.item.tasks.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated tasks, yet.</div>
              </div>}
          </div>
          <div className='col-md-6'>
            <div>
              <h2>Methods
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Method')}
                  onClickRemove={() => this.handleOnClickRemove('Method')}
                />
              </h2>
              <hr />
            </div>
            {(this.state.item.methods.length > 0) &&
              <Table
                columns={[{
                  title: 'Method',
                  dataIndex: 'name',
                  key: 'name',
                  width: 700
                }]}
                data={this.state.item.methods.map(row =>
                  ({
                    key: row._id,
                    name: row.name
                  }))}
                onRow={(record) => ({
                  onClick () { window.location = '/Method/' + record.key }
                })}
                tableLayout='auto'
                rowClassName='index-table-link'
                showHeader={false}
              />}
            {(this.state.item.methods.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated methods, yet.</div>
              </div>}
          </div>
        </div>
        <br />
        <div className='row'>
          <div className='col-md-12'>
            <div>
              <h2>Results
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Result')}
                  onClickRemove={() => this.handleOnClickRemove('Result')}
                />
              </h2>
              <hr />
            </div>
            {(this.state.item.results.length > 0) &&
              <Table
                columns={[
                  {
                    title: 'Task',
                    dataIndex: 'taskName',
                    key: 'taskName',
                    width: 300
                  },
                  {
                    title: 'Method',
                    dataIndex: 'methodName',
                    key: 'methodName',
                    width: 300
                  },
                  {
                    title: 'Metric',
                    dataIndex: 'metricName',
                    key: 'metricName',
                    width: 300
                  },
                  {
                    title: 'Value',
                    dataIndex: 'metricValue',
                    key: 'metricValue',
                    width: 300
                  }
                ]}
                data={this.state.item.results.length
                  ? this.state.item.results.map(row =>
                      ({
                        key: row._id,
                        taskName: row.task.name,
                        methodName: row.method.name,
                        metricName: row.metricName,
                        metricValue: row.metricValue
                      }))
                  : []}
                tableLayout='auto'
              />}
            {(this.state.item.results.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated results, yet.</div>
              </div>}
          </div>
        </div>
        <br />
        <div className='row'>
          <div className='col-md-12'>
            <div>
              <h2>Tags
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Tag')}
                  onClickRemove={() => this.handleOnClickRemove('Tag')}
                />
              </h2>
              <hr />
            </div>
            {(this.state.item.tags.length > 0) &&
              this.state.item.tags.map(tag => <span key={tag._id}><Link to={'/Tag/' + tag.name}>{tag.name}</Link> </span>)}
            {(this.state.item.tags.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated tags, yet.</div>
              </div>}
          </div>
        </div>
        <Modal show={this.state.showAddModal} onHide={this.handleHideAddModal}>
          {(this.state.modalMode === 'Login') &&
            <Modal.Header closeButton>
              <Modal.Title>Add</Modal.Title>
            </Modal.Header>}
          {(this.state.modalMode !== 'Login') &&
            <Modal.Header closeButton>
              <Modal.Title>Add {this.state.modalMode}</Modal.Title>
            </Modal.Header>}
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to='/Login'>login</Link> before editing.
              </span>}
            {(this.state.modalMode === 'Method') &&
              <span>
                <FormFieldSelectRow
                  inputName='methodId'
                  label='Method'
                  options={this.state.methodNames}
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                /><br />
                Not in the list?<br />
                <Accordion defaultActiveKey='0'>
                  <Card>
                    <Card.Header>
                      <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                        <FontAwesomeIcon icon='plus' /> Create a new method.
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey='1'>
                      <Card.Body>
                        <form onSubmit={this.handleOnSubmitMethod}>
                          <FormFieldRow
                            inputName='methodName'
                            inputType='text'
                            label='Name'
                            onChange={(field, value) => this.handleOnChange('method', field, value)}
                            validRegex={methodNameRegex}
                          /><br />
                          <FormFieldRow
                            inputName='methodFullName'
                            inputType='text'
                            label='Full name'
                            onChange={(field, value) => this.handleOnChange('method', field, value)}
                            validRegex={methodNameRegex}
                          /><br />
                          <FormFieldRow
                            inputName='description'
                            inputType='text'
                            label='Description'
                            onChange={(field, value) => this.handleOnChange('method', field, value)}
                          />
                        </form>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </span>}
            {(this.state.modalMode === 'Task') &&
              <span>
                <FormFieldSelectRow
                  inputName='taskId'
                  label='Task'
                  options={this.state.taskNames}
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                /><br />
                Not in the list?<br />
                <Accordion defaultActiveKey='0'>
                  <Card>
                    <Card.Header>
                      <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                        <FontAwesomeIcon icon='plus' /> Create a new task.
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey='1'>
                      <Card.Body>
                        <form onSubmit={this.handleOnSubmitTask}>
                          <FormFieldRow
                            inputName='taskName'
                            inputType='text'
                            label='Name'
                            onChange={(field, value) => this.handleOnChange('task', field, value)}
                            validRegex={taskNameRegex}
                          /><br />
                          <FormFieldSelectRow
                            inputName='taskParent'
                            label='Parent task (if any)'
                            options={this.state.taskNames}
                            onChange={(field, value) => this.handleOnChange('task', field, value)}
                          /><br />
                          <FormFieldRow
                            inputName='description'
                            inputType='text'
                            label='Description'
                            onChange={(field, value) => this.handleOnChange('task', field, value)}
                          />
                        </form>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </span>}
            {(this.state.modalMode === 'Result') &&
              <span>
                <FormFieldSelectRow
                  inputName='task' label='Task'
                  options={this.state.item.tasks}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                /><br />
                <FormFieldSelectRow
                  inputName='method' label='Method'
                  options={this.state.item.methods}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                /><br />
                <FormFieldTypeaheadRow
                  inputName='metricName' label='Metric name'
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  validRegex={metricNameRegex}
                  options={this.state.metricNames}
                  value=''
                /><br />
                <FormFieldRow
                  inputName='metricValue' inputType='number' label='Metric value'
                  validRegex={metricValueRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                /><br />
                <FormFieldRow
                  inputName='evaluatedDate' inputType='date' label='Evaluated'
                  validRegex={dateRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                /><br />
                <FormFieldRow
                  inputName='isHigherBetter' inputType='checkbox' label='Is higher better?'
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                />
              </span>}
            {(this.state.modalMode === 'Tag') &&
              <span>
                <FormFieldTypeaheadRow
                  inputName='tag' label='Tag'
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                  validRegex={tagNameRegex}
                  options={this.state.tagNames.map(item => item.name)}
                /><br />
              </span>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={this.handleAddModalSubmit}>
              {(this.state.modalMode === 'Login') ? 'Cancel' : 'Submit'}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showRemoveModal} onHide={this.handleHideRemoveModal}>
          <Modal.Header closeButton>
            <Modal.Title>Remove</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to='/Login'>login</Link> before editing.
              </span>}
            {(this.state.modalMode === 'Task') &&
              <span>
                <b>Attached tasks:</b><br />
                {(this.state.item.tasks.length > 0) &&
                  this.state.item.tasks.map(task =>
                    <div key={task._id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {task.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnTaskRemove(task._id)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.tasks.length === 0) &&
                  <span><i>There are no attached tasks.</i></span>}
              </span>}
            {(this.state.modalMode === 'Method') &&
              <span>
                <b>Attached methods:</b><br />
                {(this.state.item.methods.length > 0) &&
                  this.state.item.methods.map(method =>
                    <div key={method._id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {method.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnMethodRemove(method._id)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.methods.length === 0) &&
                  <span><i>There are no attached methods.</i></span>}
              </span>}
            {(this.state.modalMode === 'Result') &&
              <span>
                <b>Attached results:</b><br />
                {(this.state.item.results.length > 0) &&
                  this.state.item.results.map(result =>
                    <div key={result._id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {result.task.name}, {result.method.name}, {result.metricName}: {result.metricValue}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnResultRemove(result._id)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.results.length === 0) &&
                  <span><i>There are no attached results.</i></span>}
              </span>}
            {(this.state.modalMode === 'Tag') &&
              <span>
                <b>Attached tags:</b><br />
                {(this.state.item.results.length > 0) &&
                  this.state.item.tags.map(tag =>
                    <div key={tag._id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {tag.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnTagRemove(tag.name)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.tags.length === 0) &&
                  <span><i>There are no attached tags.</i></span>}
              </span>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={this.handleRemoveModalDone}>
              {(this.state.modalMode === 'Login') ? 'Cancel' : 'Done'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Submission
