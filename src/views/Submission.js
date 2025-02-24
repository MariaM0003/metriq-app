import axios from 'axios'
import React from 'react'
import config from './../config'
import Table from 'rc-table'
import ErrorHandler from './../components/ErrorHandler'
import EditButton from '../components/EditButton'
import FormFieldRow from '../components/FormFieldRow'
import FormFieldSelectRow from '../components/FormFieldSelectRow'
import FormFieldTypeaheadRow from '../components/FormFieldTypeaheadRow'
import TooltipTrigger from '../components/TooltipTrigger'
import { Accordion, Button, Card, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faExternalLinkAlt, faHeart, faPlus, faTrash, faMobileAlt, faStickyNote, faSuperscript } from '@fortawesome/free-solid-svg-icons'
import logo from './../images/metriq_logo_secondary_blue.png'
import Commento from '../components/Commento'
import FormFieldAlertRow from '../components/FormFieldAlertRow'
import FormFieldWideRow from '../components/FormFieldWideRow'
import SocialShareIcons from '../components/SocialShareIcons'
import { dateRegex, metricValueRegex, nonblankRegex, standardErrorRegex } from '../components/ValidationRegex'

library.add(faEdit, faExternalLinkAlt, faHeart, faPlus, faTrash, faMobileAlt, faStickyNote, faSuperscript)

const sampleSizeRegex = /^[0-9]+$/

class Submission extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isValidated: false,
      requestFailedMessage: '',
      isArxiv: false,
      vanityUrl: '',
      bibtexUrl: '',
      thumbnailUrl: '',
      item: { isUpvoted: false, upvotesCount: 0, tags: [], tasks: [], methods: [], platforms: [], results: [], user: [] },
      metricNames: [],
      methodNames: [],
      taskNames: [],
      tagNames: [],
      allMethodNames: [],
      allTaskNames: [],
      allTagNames: [],
      allPlatformNames: [],
      showAddModal: false,
      showRemoveModal: false,
      showEditModal: false,
      showAccordion: false,
      modalMode: '',
      modalTextMode: '',
      submission: {
        description: ''
      },
      moderationReport: {
        description: ''
      },
      result: {
        id: '',
        task: '',
        method: '',
        platform: '',
        metricName: '',
        metricValue: 0,
        isHigherBetter: false,
        evaluatedDate: new Date()
      },
      task: {
        name: '',
        fullName: '',
        parentTask: '',
        description: '',
        submissions: this.props.match.params.id
      },
      method: {
        name: '',
        fullName: '',
        description: '',
        submissions: this.props.match.params.id
      },
      platform: {
        name: '',
        fullName: '',
        parentPlatform: '',
        description: '',
        submissions: this.props.match.params.id
      },
      taskId: '',
      methodId: '',
      platformId: '',
      tag: ''
    }

    this.handleEditSubmissionDetails = this.handleEditSubmissionDetails.bind(this)
    this.handleModerationReport = this.handleModerationReport.bind(this)
    this.handleHideEditModal = this.handleHideEditModal.bind(this)
    this.handleEditModalDone = this.handleEditModalDone.bind(this)
    this.handleAccordionToggle = this.handleAccordionToggle.bind(this)
    this.handleUpVoteOnClick = this.handleUpVoteOnClick.bind(this)
    this.handleOnClickAdd = this.handleOnClickAdd.bind(this)
    this.handleOnClickRemove = this.handleOnClickRemove.bind(this)
    this.handleOnClickAddResult = this.handleOnClickAddResult.bind(this)
    this.handleOnClickEditResult = this.handleOnClickEditResult.bind(this)
    this.handleHideAddModal = this.handleHideAddModal.bind(this)
    this.handleHideRemoveModal = this.handleHideRemoveModal.bind(this)
    this.handleAddModalSubmit = this.handleAddModalSubmit.bind(this)
    this.handleRemoveModalDone = this.handleRemoveModalDone.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleOnTaskRemove = this.handleOnTaskRemove.bind(this)
    this.handleOnMethodRemove = this.handleOnMethodRemove.bind(this)
    this.handleOnPlatformRemove = this.handleOnPlatformRemove.bind(this)
    this.handleOnResultRemove = this.handleOnResultRemove.bind(this)
    this.handleOnTagRemove = this.handleOnTagRemove.bind(this)
    this.handleSortNames = this.handleSortNames.bind(this)
    this.handleTrimTasks = this.handleTrimTasks.bind(this)
    this.handleTrimMethods = this.handleTrimMethods.bind(this)
    this.handleTrimPlatforms = this.handleTrimPlatforms.bind(this)
    this.handleTrimTags = this.handleTrimTags.bind(this)
    this.isAllValid = this.isAllValid.bind(this)
  }

  handleEditSubmissionDetails () {
    let mode = 'Edit'
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    const submission = { thumbnailUrl: this.state.item.thumbnailUrl, description: this.state.item.description }
    this.setState({ showEditModal: true, modalMode: mode, submission: submission })
  }

  handleModerationReport () {
    let mode = 'Moderation'
    const modalTextMode = 'Moderation'
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    const submission = { thumbnailUrl: this.state.item.thumbnailUrl, description: this.state.item.description }
    this.setState({ showEditModal: true, modalMode: mode, modalTextMode: modalTextMode, submission: submission })
  }

  handleHideEditModal () {
    this.setState({ showEditModal: false })
  }

  handleEditModalDone () {
    if (!this.props.isLoggedIn) {
      this.props.history.push('/Login')
      return
    }

    const isModerationReport = (this.state.modalMode === 'Moderation')

    const reqBody = {}
    if (isModerationReport) {
      reqBody.description = this.state.moderationReport.description
    } else {
      reqBody.thumbnailUrl = this.state.submission.thumbnailUrl
      reqBody.description = this.state.submission.description
    }

    let requestUrl = config.api.getUriPrefix() + '/submission/' + this.props.match.params.id
    if (isModerationReport) {
      requestUrl = requestUrl + '/report'
    }

    axios.post(requestUrl, reqBody)
      .then(res => {
        if (isModerationReport) {
          window.alert('Thank you, your report has been submitted to the moderators. They will contact you via your Metriq account email, if further action is necessary.')
          this.setState({ showEditModal: false })
        } else {
          this.setState({ item: res.data.data, showEditModal: false })
        }
      })
      .catch(err => {
        window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
      })
  }

  handleAccordionToggle () {
    this.setState({ showAccordion: !this.state.showAccordion, isValidated: false })
  }

  handleOnChange (key1, key2, value) {
    if (!value && value !== false && value !== 0) {
      value = null
    }
    if (key1) {
      const k1 = this.state[key1]
      k1[key2] = value
      this.setState({ [key1]: k1, isValidated: false })
    } else {
      this.setState({ [key2]: value, isValidated: false })
    }
  }

  handleOnTaskRemove (taskId) {
    if (!window.confirm('Are you sure you want to remove this task from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/task/' + taskId)
        .then(res => {
          const submission = res.data.data
          const tasks = [...this.state.allTaskNames]
          this.handleTrimTasks(submission, tasks)
          this.setState({ item: submission, taskNames: tasks })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      this.props.history.push('/Login')
    }
  }

  handleOnMethodRemove (methodId) {
    if (!window.confirm('Are you sure you want to remove this method from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/method/' + methodId)
        .then(res => {
          const submission = res.data.data
          const methods = [...this.state.allMethodNames]
          this.handleSortMethods(methods)
          this.handleTrimMethods(submission, methods)
          this.setState({ item: submission, methodNames: methods })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      this.props.history.push('/Login')
    }
  }

  handleOnPlatformRemove (platformId) {
    if (!window.confirm('Are you sure you want to remove this platform from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/platform/' + platformId)
        .then(res => {
          const submission = res.data.data
          const platforms = [...this.state.allPlatformNames]
          this.handleSortPlatforms(platforms)
          this.handleTrimPlatforms(submission, platforms)
          this.setState({ item: submission, platformNames: platforms })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      this.props.history.push('/Login')
    }
  }

  handleOnTagRemove (tagName) {
    if (!window.confirm('Are you sure you want to remove this tag from the submission?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/tag/' + tagName)
        .then(res => {
          const submission = res.data.data
          const tags = [...this.state.allTagNames]
          this.handleTrimTags(submission, tags)
          this.setState({ item: submission, tagNames: tags })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      this.props.history.push('/Login')
    }
  }

  handleOnResultRemove (resultId) {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return
    }
    if (this.props.isLoggedIn) {
      axios.delete(config.api.getUriPrefix() + '/result/' + resultId)
        .then(res => {
          const rId = res.data.data.id
          const item = { ...this.state.item }
          for (let i = 0; i < item.results.length; i++) {
            if (item.results[i].id === rId) {
              item.results.splice(i, 1)
              break
            }
          }
          this.setState({ item: item })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else {
      this.props.history.push('/Login')
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
      this.props.history.push('/Login')
    }
    event.preventDefault()
  }

  handleOnClickAdd (mode) {
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    this.setState({ showAddModal: true, showAccordion: false, modalMode: mode, isValidated: false })
  }

  handleOnClickRemove (mode) {
    if (!this.props.isLoggedIn) {
      mode = 'Login'
    }
    this.setState({ showRemoveModal: true, modalMode: mode })
  }

  handleOnClickAddResult () {
    const result = {
      id: '',
      task: '',
      method: '',
      platform: '',
      metricName: '',
      metricValue: 0,
      isHigherBetter: false,
      evaluatedDate: new Date()
    }
    this.setState({ result: result })
    this.handleOnClickAdd('Result')
  }

  handleOnClickEditResult (resultId) {
    for (let i = 0; i < this.state.item.results.length; i++) {
      if (this.state.item.results[i].id === resultId) {
        const result = { ...this.state.item.results[i] }
        result.submissionId = this.state.item.id
        if (result.task.id !== undefined) {
          result.task = result.task.id
        }
        if (result.method.id !== undefined) {
          result.method = result.method.id
        }
        if ((result.platform !== null) && (result.platform.id !== undefined)) {
          result.platform = result.platform.id
        }
        this.setState({ result: result })
        break
      }
    }
    this.handleOnClickAdd('Result')
  }

  handleHideAddModal () {
    this.setState({ showAddModal: false, showAccordion: false })
  }

  handleHideRemoveModal () {
    this.setState({ showRemoveModal: false })
  }

  handleAddModalSubmit () {
    if (!this.props.isLoggedIn) {
      this.props.history.push('/Login')
      return
    }

    if (this.state.modalMode === 'Task') {
      if (this.state.showAccordion) {
        const task = this.state.task
        if (!task.fullName) {
          task.fullName = task.name
        }
        if (!task.description) {
          task.description = ''
        }
        if (!task.parentTask) {
          const options = this.state.allTaskNames
          options.sort((a, b) => (a.top < b.top) ? 1 : -1)
          task.parentTask = options.filter(x => x.top === 1)[0].id
        }
        axios.post(config.api.getUriPrefix() + '/task', task)
          .then(res => {
            window.location.reload()
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      } else {
        axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/task/' + this.state.taskId, {})
          .then(res => {
            const submission = res.data.data
            const tasks = [...this.state.taskNames]
            for (let j = 0; j < tasks.length; j++) {
              if (this.state.taskId === tasks[j].id) {
                tasks.splice(j, 1)
                break
              }
            }
            this.setState({ requestFailedMessage: '', taskNames: tasks, item: submission })
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      }
    } else if (this.state.modalMode === 'Method') {
      if (this.state.showAccordion) {
        const method = this.state.method
        if (!method.fullName) {
          method.fullName = method.name
        }
        if (!method.description) {
          method.description = ''
        }
        axios.post(config.api.getUriPrefix() + '/method', method)
          .then(res => {
            window.location.reload()
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      } else {
        axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/method/' + this.state.methodId, {})
          .then(res => {
            const submission = res.data.data
            const methods = [...this.state.methodNames]
            for (let j = 0; j < methods.length; j++) {
              if (this.state.methodId === methods[j].id) {
                methods.splice(j, 1)
                break
              }
            }
            this.setState({ requestFailedMessage: '', methodNames: methods, item: submission })
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      }
    } else if (this.state.modalMode === 'Platform') {
      if (this.state.showAccordion) {
        const platform = this.state.platform
        if (!platform.fullName) {
          platform.fullName = platform.name
        }
        if (!platform.description) {
          platform.description = ''
        }
        axios.post(config.api.getUriPrefix() + '/platform', platform)
          .then(res => {
            window.location.reload()
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      } else {
        axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/platform/' + this.state.platformId, {})
          .then(res => {
            const submission = res.data.data
            const platforms = [...this.state.platformNames]
            for (let j = 0; j < platforms.length; j++) {
              if (this.state.platformId === platforms[j].id) {
                platforms.splice(j, 1)
                break
              }
            }
            this.setState({ requestFailedMessage: '', platformNames: platforms, item: submission })
          })
          .catch(err => {
            window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
          })
      }
    } else if (this.state.modalMode === 'Tag') {
      axios.post(config.api.getUriPrefix() + '/submission/' + this.props.match.params.id + '/tag/' + this.state.tag, {})
        .then(res => {
          const submission = res.data.data
          const tags = [...this.state.tagNames]
          for (let j = 0; j < tags.length; j++) {
            if (this.state.tag === tags[j].name) {
              tags.splice(j, 1)
              break
            }
          }
          this.setState({ requestFailedMessage: '', tagNames: tags, item: submission })
        })
        .catch(err => {
          window.alert('Error: ' + ErrorHandler(err) + '\nSorry! Check your connection and login status, and try again.')
        })
    } else if (this.state.modalMode === 'Result') {
      const result = this.state.result
      if (!result.metricName) {
        window.alert('Error: Metric Name cannot be blank.')
      }
      if (!result.metricValue && result.metricValue !== 0) {
        window.alert('Error: Metric Value cannot be blank.')
      }
      if (!result.task) {
        result.task = this.state.item.tasks[0].id
      }
      if (!result.method) {
        result.method = this.state.item.methods[0].id
      }
      if (!result.platform) {
        result.platform = null
      }
      if (!result.evaluatedDate) {
        result.evaluatedDate = new Date()
      }
      const resultRoute = config.api.getUriPrefix() + (result.id ? ('/result/' + result.id) : ('/submission/' + this.props.match.params.id + '/result'))
      axios.post(resultRoute, result)
        .then(res => {
          this.setState({ requestFailedMessage: '', item: res.data.data })
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

  handleSortNames (names) {
    names.sort(function (a, b) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
      return 0
    })
  }

  handleTrimTasks (submission, tasks) {
    for (let i = 0; i < submission.tasks.length; i++) {
      for (let j = 0; j < tasks.length; j++) {
        if (submission.tasks[i].id === tasks[j].id) {
          tasks.splice(j, 1)
          break
        }
      }
    }
  }

  handleTrimMethods (submission, methods) {
    for (let i = 0; i < submission.methods.length; i++) {
      for (let j = 0; j < methods.length; j++) {
        if (submission.methods[i].id === methods[j].id) {
          methods.splice(j, 1)
          break
        }
      }
    }
  }

  handleTrimPlatforms (submission, platforms) {
    for (let i = 0; i < submission.platforms.length; i++) {
      for (let j = 0; j < platforms.length; j++) {
        if (submission.platforms[i].id === platforms[j].id) {
          platforms.splice(j, 1)
          break
        }
      }
    }
  }

  handleTrimTags (submission, tags) {
    for (let i = 0; i < submission.tags.length; i++) {
      for (let j = 0; j < tags.length; j++) {
        if (submission.tags[i].id === tags[j].id) {
          tags.splice(j, 1)
          break
        }
      }
    }
  }

  isAllValid () {
    if (this.state.modalMode === 'Login') {
      if (this.state.isValidated) {
        this.setState({ isValidated: true })
      }
      return true
    }

    if (this.state.modalMode === 'Task') {
      if (this.state.showAccordion) {
        if (!nonblankRegex.test(this.state.task.name)) {
          return false
        }
      } else if (!this.state.taskId) {
        return false
      }
    } else if (this.state.modalMode === 'Method') {
      if (this.state.showAccordion) {
        if (!nonblankRegex.test(this.state.method.name)) {
          return false
        }
      } else if (!this.state.methodId) {
        return false
      }
    } else if (this.state.modalMode === 'Platform') {
      if (this.state.showAccordion) {
        if (!nonblankRegex.test(this.state.platform.name)) {
          return false
        }
      } else if (!this.state.platformId) {
        return false
      }
    } else if (this.state.modalMode === 'Result') {
      if (!nonblankRegex.test(this.state.result.metricName)) {
        return false
      }
      if (!metricValueRegex.test(this.state.result.metricValue)) {
        return false
      }
    }

    if (this.state.isValidated) {
      this.setState({ isValidated: true })
    }

    return true
  }

  componentDidMount () {
    window.scrollTo(0, 0)

    const submissionRoute = config.api.getUriPrefix() + '/submission/' + this.props.match.params.id
    axios.get(submissionRoute)
      .then(subRes => {
        const submission = subRes.data.data

        let isArxiv = false
        let vanityUrl = ''
        let bibtexUrl = ''
        const thumbnailUrl = submission.thumbnailUrl
        const url = submission.contentUrl
        if (url.toLowerCase().startsWith('https://arxiv.org/')) {
          isArxiv = true
          let urlTail = url.substring(18)
          vanityUrl = 'https://www.arxiv-vanity.com/' + urlTail
          urlTail = urlTail.substring(4)
          bibtexUrl = 'https://arxiv.org/bibtex/' + urlTail
        }

        // Just get the view populated as quickly as possible, before we "trim."
        this.setState({ requestFailedMessage: '', item: submission, isArxiv: isArxiv, vanityUrl: vanityUrl, thumbnailUrl: thumbnailUrl, bibtexUrl: bibtexUrl })

        const taskNamesRoute = config.api.getUriPrefix() + '/task/names'
        axios.get(taskNamesRoute)
          .then(res => {
            this.handleSortNames(res.data.data)
            const tasks = [...res.data.data]
            this.handleTrimTasks(submission, tasks)

            let defTask = ''
            if (tasks.length) {
              defTask = tasks[0].id
            }

            this.setState({ requestFailedMessage: '', allTaskNames: res.data.data, taskNames: tasks, taskId: defTask })
          })
          .catch(err => {
            this.setState({ requestFailedMessage: ErrorHandler(err) })
          })

        const methodNamesRoute = config.api.getUriPrefix() + '/method/names'
        axios.get(methodNamesRoute)
          .then(res => {
            this.handleSortNames(res.data.data)
            const methods = [...res.data.data]
            this.handleTrimMethods(submission, methods)

            let defMethod = ''
            if (methods.length) {
              defMethod = methods[0].id
            }

            this.setState({ requestFailedMessage: '', allMethodNames: res.data.data, methodNames: methods, methodId: defMethod })
          })
          .catch(err => {
            this.setState({ requestFailedMessage: ErrorHandler(err) })
          })

        const platformNamesRoute = config.api.getUriPrefix() + '/platform/names'
        axios.get(platformNamesRoute)
          .then(res => {
            this.handleSortNames(res.data.data)
            const platforms = [...res.data.data]
            this.handleTrimPlatforms(submission, platforms)

            let defPlatform = ''
            if (platforms.length) {
              defPlatform = platforms[0].id
            }

            this.setState({ requestFailedMessage: '', allPlatformNames: res.data.data, platformNames: platforms, platformId: defPlatform })
          })
          .catch(err => {
            this.setState({ requestFailedMessage: ErrorHandler(err) })
          })

        const tagNamesRoute = config.api.getUriPrefix() + '/tag/names'
        axios.get(tagNamesRoute)
          .then(res => {
            const tags = [...res.data.data]
            this.handleTrimTags(submission, tags)

            this.setState({ requestFailedMessage: '', allTagNames: res.data.data, tagNames: tags })
          })
          .catch(err => {
            this.setState({ requestFailedMessage: ErrorHandler(err) })
          })
      })
      .catch(err => {
        this.setState({ requestFailedMessage: ErrorHandler(err) })
      })

    const metricNameRoute = config.api.getUriPrefix() + '/result/metricNames'
    axios.get(metricNameRoute)
      .then(subRes => {
        const metricNames = subRes.data.data
        this.setState({ metricNames: metricNames })
      })
      .catch(err => {
        this.setState({ requestFailedMessage: ErrorHandler(err) })
      })
  }

  render () {
    return (
      <div id='metriq-main-content' className='container submission-detail-container'>
        <FormFieldWideRow>
          <div><h1>{this.state.item.name}</h1></div>
        </FormFieldWideRow>
        <div className='text-center'>
          <img src={this.state.item.thumbnailUrl ? this.state.item.thumbnailUrl : logo} alt='Submission thumbnail' className='submission-image' />
        </div>
        <FormFieldWideRow>
          <div className='submission-description'>
            <b>Submitted by <Link to={'/User/' + this.state.item.userId + '/Submissions'}>{this.state.item.user.username}</Link> on {this.state.item.createdAt ? new Date(this.state.item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</b>
          </div>
        </FormFieldWideRow>
        <FormFieldWideRow>
          <div className='submission-description'>
            {this.state.item.description ? this.state.item.description : <div className='card bg-light'><div className='card-body'><i>(No description provided.)</i><button className='btn btn-link' onClick={this.handleEditSubmissionDetails}>Add one.</button></div></div>}
          </div>
        </FormFieldWideRow>
        <FormFieldWideRow>
          <TooltipTrigger message='Upvote submission'>
            <button className={'submission-button btn ' + (this.state.item.isUpvoted ? 'btn-primary' : 'btn-secondary')} onClick={this.handleUpVoteOnClick}><FontAwesomeIcon icon='heart' /> {this.state.item.upvotesCount}</button>
          </TooltipTrigger>
          <TooltipTrigger message='Submission link'>
            <button className='submission-button btn btn-secondary' onClick={() => { window.open(this.state.item.contentUrl, '_blank') }}><FontAwesomeIcon icon={faExternalLinkAlt} /></button>
          </TooltipTrigger>
          {this.state.isArxiv &&
            <span>
              <TooltipTrigger message='Mobile view preprint'>
                <button className='submission-button btn btn-secondary' onClick={() => { window.open(this.state.vanityUrl, '_blank') }}><FontAwesomeIcon icon={faMobileAlt} /></button>
              </TooltipTrigger>
              <TooltipTrigger message='BibTex reference'>
                <button className='submission-button btn btn-secondary' onClick={() => { window.open(this.state.bibtexUrl, '_blank') }}><FontAwesomeIcon icon={faSuperscript} /></button>
              </TooltipTrigger>
            </span>}
          <TooltipTrigger message='Edit submission'>
            <button className='submission-button btn btn-secondary' onClick={this.handleEditSubmissionDetails}><FontAwesomeIcon icon='edit' /></button>
          </TooltipTrigger>
          <SocialShareIcons url={config.api.getUriPrefix() + '/submission/' + this.props.match.params.id} />
        </FormFieldWideRow>
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
              <small><i>Tasks are the goal of a given benchmark, e.g., an end application</i></small>
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
                    key: row.id,
                    name: row.name,
                    history: this.props.history
                  }))}
                onRow={(record) => ({
                  onClick () { record.history.push('/Task/' + record.key) }
                })}
                tableLayout='auto'
                rowClassName='link'
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
              <small><i>Methods can be techniques, protocols, or procedures</i></small>
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
                    key: row.id,
                    name: row.name,
                    history: this.props.history
                  }))}
                onRow={(record) => ({
                  onClick () { record.history.push('/Method/' + record.key) }
                })}
                tableLayout='auto'
                rowClassName='link'
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
          <div className='col-md-6'>
            <div>
              <h2>Platforms
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Platform')}
                  onClickRemove={() => this.handleOnClickRemove('Platform')}
                />
              </h2>
              <small><i>Platforms refer to real or simulated hardware & software environments</i></small>
              <hr />
            </div>
            {(this.state.item.platforms.length > 0) &&
              <Table
                columns={[{
                  title: 'Platform',
                  dataIndex: 'name',
                  key: 'name',
                  width: 700
                }]}
                data={this.state.item.platforms.map(row =>
                  ({
                    key: row.id,
                    name: row.name,
                    history: this.props.history
                  }))}
                onRow={(record) => ({
                  onClick () { record.history.push('/Platform/' + record.key) }
                })}
                tableLayout='auto'
                rowClassName='link'
                showHeader={false}
              />}
            {(this.state.item.platforms.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated platforms, yet.</div>
              </div>}
          </div>
          <div className='col-md-6'>
            <div>
              <h2>Tags
                <EditButton
                  className='float-right edit-button btn'
                  onClickAdd={() => this.handleOnClickAdd('Tag')}
                  onClickRemove={() => this.handleOnClickRemove('Tag')}
                />
              </h2>
              <small><i>Use tags to classify and discover the state of the art</i></small>
              <hr />
            </div>
            {(this.state.item.tags.length > 0) &&
                this.state.item.tags.map((tag, ind) => <span key={tag.id}>{ind > 0 && <span> • </span>}<Link to={'/Tag/' + tag.name}><span className='link'>{tag.name}</span></Link></span>)}
            {(this.state.item.tags.length === 0) &&
              <div className='card bg-light'>
                <div className='card-body'>There are no associated tags, yet.</div>
              </div>}
          </div>
        </div>
        <br />
        <FormFieldWideRow>
          <div>
            <h2>Results
              <EditButton
                className='float-right edit-button btn'
                onClickAdd={() => this.handleOnClickAddResult()}
                onClickRemove={() => this.handleOnClickRemove('Result')}
              />
            </h2>
            <small><i>Results are metric name/value pairs that can be extracted from Submissions (papers, codebases, etc.)</i></small>
            <hr />
          </div>
          {(this.state.item.results.length > 0) &&
            <Table
              columns={[
                {
                  title: 'Task',
                  dataIndex: 'taskName',
                  key: 'taskName',
                  width: 224
                },
                {
                  title: 'Method',
                  dataIndex: 'methodName',
                  key: 'methodName',
                  width: 224
                },
                {
                  title: 'Platform',
                  dataIndex: 'platformName',
                  key: 'platformName',
                  width: 224
                },
                {
                  title: 'Metric',
                  dataIndex: 'metricName',
                  key: 'metricName',
                  width: 224
                },
                {
                  title: 'Value',
                  dataIndex: 'metricValue',
                  key: 'metricValue',
                  width: 224
                },
                {
                  title: 'Notes',
                  dataIndex: 'notes',
                  key: 'notes',
                  width: 40,
                  render: (value, row, index) =>
                    <div className='text-center'>
                      {row.notes &&
                        <TooltipTrigger message={<span className='display-linebreak'>{row.notes}</span>}>
                          <div className='text-center'><FontAwesomeIcon icon='sticky-note' /></div>
                        </TooltipTrigger>}
                    </div>
                },
                {
                  title: '',
                  dataIndex: 'edit',
                  key: 'edit',
                  width: 40,
                  render: (value, row, index) =>
                    <div className='text-center'>
                      <FontAwesomeIcon icon='edit' onClick={() => this.handleOnClickEditResult(row.key)} />
                    </div>
                }
              ]}
              data={this.state.item.results.length
                ? this.state.item.results.map(row =>
                    ({
                      key: row.id,
                      taskName: row.task.name,
                      methodName: row.method.name,
                      platformName: row.platform ? row.platform.name : '(None)',
                      metricName: row.metricName,
                      metricValue: row.metricValue,
                      notes: row.notes
                    }))
                : []}
              tableLayout='auto'
            />}
          {(this.state.item.results.length === 0) &&
            <div className='card bg-light'>
              <div className='card-body'>There are no associated results, yet.</div>
            </div>}
        </FormFieldWideRow>
        <br />
        <FormFieldWideRow>
          <hr />
          <div className='text-center'>
            Notice something about this submission that needs moderation? <span className='link' onClick={this.handleModerationReport}>Let us know.</span>
          </div>
        </FormFieldWideRow>
        <FormFieldWideRow>
          <hr />
          <Commento id={'submission-' + toString(this.state.item.id)} />
        </FormFieldWideRow>
        <Modal
          show={this.state.showAddModal} onHide={this.handleHideAddModal}
          size='lg'
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          {(this.state.modalMode === 'Login') &&
            <Modal.Header closeButton>
              <Modal.Title>Add</Modal.Title>
            </Modal.Header>}
          {(this.state.modalMode !== 'Login') &&
            <Modal.Header closeButton>
              <Modal.Title>{(this.state.modalMode === 'Result' && this.state.result.id) ? 'Edit' : 'Add'} {this.state.modalMode}</Modal.Title>
            </Modal.Header>}
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to={'/Login/' + encodeURIComponent('Submission/' + this.props.match.params.id)}>login</Link> before editing.
              </span>}
            {(this.state.modalMode === 'Method') &&
              <span>
                <FormFieldSelectRow
                  inputName='methodId'
                  label='Method'
                  options={this.state.methodNames}
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                  tooltip='A method used in or by this submission, (to perform a task)'
                  disabled={this.state.showAccordion}
                /><br />
                Not in the list?<br />
                <Accordion defaultActiveKey='0'>
                  <Card>
                    <Card.Header>
                      <Accordion.Toggle as={Button} variant='link' eventKey='1' onClick={this.handleAccordionToggle}>
                        <FontAwesomeIcon icon='plus' /> Create a new method.
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey='1'>
                      <Card.Body>
                        <FormFieldRow
                          inputName='name'
                          inputType='text'
                          label='Name'
                          onChange={(field, value) => this.handleOnChange('method', field, value)}
                          validRegex={nonblankRegex}
                          tooltip='Short name of new method'
                        /><br />
                        <FormFieldRow
                          inputName='fullName'
                          inputType='text'
                          label='Full name (optional)'
                          onChange={(field, value) => this.handleOnChange('method', field, value)}
                          tooltip='Long name of new method'
                        /><br />
                        <FormFieldSelectRow
                          inputName='parentMethod'
                          label='Parent method<br/>(if any)'
                          isNullDefault
                          options={this.state.allMethodNames}
                          onChange={(field, value) => this.handleOnChange('method', field, value)}
                          tooltip='Optionally, the new method is a sub-method of a "parent" method.'
                        /><br />
                        <FormFieldRow
                          inputName='description'
                          inputType='textarea'
                          label='Description (optional)'
                          onChange={(field, value) => this.handleOnChange('method', field, value)}
                          tooltip='Long description of new method'
                        />
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
                  tooltip='A task performed in or by this submission, (using a method)'
                  disabled={this.state.showAccordion}
                /><br />
                Not in the list?<br />
                <Accordion defaultActiveKey='0'>
                  <Card>
                    <Card.Header>
                      <Accordion.Toggle as={Button} variant='link' eventKey='1' onClick={this.handleAccordionToggle}>
                        <FontAwesomeIcon icon='plus' /> Create a new task.
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey='1'>
                      <Card.Body>
                        <FormFieldRow
                          inputName='name'
                          inputType='text'
                          label='Name'
                          onChange={(field, value) => this.handleOnChange('task', field, value)}
                          validRegex={nonblankRegex}
                          tooltip='Short name of new task'
                        /><br />
                        <FormFieldRow
                          inputName='fullName'
                          inputType='text'
                          label='Full name (optional)'
                          onChange={(field, value) => this.handleOnChange('task', field, value)}
                          tooltip='Long name of new task'
                        /><br />
                        <FormFieldSelectRow
                          inputName='parentTask'
                          label='Parent task'
                          specialOptGrouplabel='Top level categories'
                          options={this.state.allTaskNames}
                          onChange={(field, value) => this.handleOnChange('task', field, value)}
                          tooltip='The new task is a sub-task of a "parent" task.'
                        /><br />
                        <FormFieldRow
                          inputName='description'
                          inputType='textarea'
                          label='Description (optional)'
                          onChange={(field, value) => this.handleOnChange('task', field, value)}
                          tooltip='Long description of new task'
                        />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </span>}
            {(this.state.modalMode === 'Platform') &&
              <span>
                <FormFieldSelectRow
                  inputName='platformId'
                  label='Platform'
                  options={this.state.platformNames}
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                  tooltip='A platform used by a method in this submission'
                  disabled={this.state.showAccordion}
                /><br />
                Not in the list?<br />
                <Accordion defaultActiveKey='0'>
                  <Card>
                    <Card.Header>
                      <Accordion.Toggle as={Button} variant='link' eventKey='1' onClick={this.handleAccordionToggle}>
                        <FontAwesomeIcon icon='plus' /> Create a new platform.
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey='1'>
                      <Card.Body>
                        <FormFieldRow
                          inputName='name'
                          inputType='text'
                          label='Name'
                          onChange={(field, value) => this.handleOnChange('platform', field, value)}
                          validRegex={nonblankRegex}
                          tooltip='Short name of new platform'
                        /><br />
                        <FormFieldRow
                          inputName='fullName'
                          inputType='text'
                          label='Full name (optional)'
                          onChange={(field, value) => this.handleOnChange('platform', field, value)}
                          tooltip='Long name of new platform'
                        /><br />
                        <FormFieldSelectRow
                          inputName='parentPlatform'
                          label='Parent platform<br/>(if any)'
                          isNullDefault
                          options={this.state.allPlatformNames}
                          onChange={(field, value) => this.handleOnChange('platform', field, value)}
                          tooltip='The new platform inherits the properties of its "parent" platform.'
                        /><br />
                        <FormFieldRow
                          inputName='description'
                          inputType='textarea'
                          label='Description (optional)'
                          onChange={(field, value) => this.handleOnChange('platform', field, value)}
                          tooltip='Long description of new platform'
                        />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </span>}
            {(this.state.modalMode === 'Result') && ((this.state.item.tasks.length === 0) || (this.state.item.methods.length === 0)) &&
              <span>
                A <b>result</b> must cross-reference a <b>task</b> and a <b>method</b>.<br /><br />Make sure to add your task and method to the submission, first.
              </span>}
            {(this.state.modalMode === 'Result') && (this.state.item.tasks.length > 0) && (this.state.item.methods.length > 0) &&
              <span>
                <FormFieldSelectRow
                  inputName='task' label='Task'
                  options={this.state.item.tasks}
                  value={this.state.result.task.id}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='Task from submission, used in this result'
                /><br />
                <FormFieldSelectRow
                  inputName='method' label='Method'
                  options={this.state.item.methods}
                  value={this.state.result.method.id}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='Method from submission, used in this result'
                /><br />
                <FormFieldSelectRow
                  inputName='platform' label='Platform'
                  options={this.state.item.platforms}
                  value={this.state.result.platform ? this.state.result.platform.id : ''}
                  isNullDefault
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='The quantum computer platform used by the method for this result'
                /><br />
                <FormFieldTypeaheadRow
                  inputName='metricName' label='Metric name'
                  value={this.state.result.metricName}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  validRegex={nonblankRegex}
                  options={this.state.metricNames}
                  tooltip='The name of the measure of performance, for this combination of task and method, for this submission'
                /><br />
                <FormFieldRow
                  inputName='metricValue' inputType='number' label='Metric value'
                  value={this.state.result.metricValue}
                  validRegex={metricValueRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='The value of the measure of performance, for this combination of task and method, for this submission'
                /><br />
                <FormFieldRow
                  inputName='evaluatedAt' inputType='date' label='Evaluated'
                  value={this.state.result.evaluatedAt}
                  validRegex={dateRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='(Optionally) What date was the metric value collected on?'
                /><br />
                <FormFieldRow
                  inputName='isHigherBetter' inputType='checkbox' label='Is higher better?'
                  checked={this.state.result.isHigherBetter}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='Does a higher value of the metric indicate better performance? (If not checked, then a lower value of the metric indicates better performance.)'
                /><br />
                <FormFieldRow
                  inputName='standardError' inputType='number' label='Standard error (optional)'
                  value={this.state.result.standardError}
                  validRegex={standardErrorRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='Confidence intervals will be calculated as (mean) result metric value ± standard error times z-score, if you report a standard error. This is self-consistent if your statistics are Gaussian or Poisson, for example, over a linear scale of the metric. (If Gaussian or Poisson statistics emerge over a different, non-linear scale of the metric, consider reporting your metric value with rescaled units.)'
                /><br />
                <FormFieldRow
                  inputName='sampleSize' inputType='number' label='Sample size (optional)'
                  value={this.state.result.sampleSize}
                  validRegex={sampleSizeRegex}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='Report the sample size used to calculate the metric value.'
                /><br />
                <FormFieldRow
                  inputName='notes' inputType='textarea' label='Notes'
                  value={this.state.result.notes}
                  onChange={(field, value) => this.handleOnChange('result', field, value)}
                  tooltip='You may include any additional notes on the result, in this field, and they will be visible to all readers.'
                />
              </span>}
            {(this.state.modalMode === 'Tag') &&
              <span>
                <FormFieldTypeaheadRow
                  inputName='tag' label='Tag'
                  onChange={(field, value) => this.handleOnChange('', field, value)}
                  validRegex={nonblankRegex}
                  options={this.state.tagNames.map(item => item.name)}
                  tooltip='A "tag" can be any string that loosely categorizes a submission by relevant topic.'
                /><br />
              </span>}
            {(this.state.modalMode !== 'Login') && <div className='text-center'><br /><b>(Mouse-over or tap labels for explanation.)</b></div>}
          </Modal.Body>
          <Modal.Footer>
            {(this.state.modalMode === 'Login') && <Button variant='primary' onClick={this.handleHideAddModal}>Cancel</Button>}
            {(this.state.modalMode !== 'Login') && <Button variant='primary' onClick={this.handleAddModalSubmit} disabled={!this.state.isValidated && !this.isAllValid()}>Submit</Button>}
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showRemoveModal} onHide={this.handleHideRemoveModal}>
          <Modal.Header closeButton>
            <Modal.Title>Remove</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to={'/Login/' + encodeURIComponent('Submission/' + this.props.match.params.id)}>login</Link> before editing.
              </span>}
            {(this.state.modalMode === 'Task') &&
              <span>
                <b>Attached tasks:</b><br />
                {(this.state.item.tasks.length > 0) &&
                  this.state.item.tasks.map(task =>
                    <div key={task.id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {task.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnTaskRemove(task.id)}><FontAwesomeIcon icon='trash' /> </button>
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
                    <div key={method.id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {method.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnMethodRemove(method.id)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.methods.length === 0) &&
                  <span><i>There are no attached methods.</i></span>}
              </span>}
            {(this.state.modalMode === 'Platform') &&
              <span>
                <b>Attached platforms:</b><br />
                {(this.state.item.platforms.length > 0) &&
                  this.state.item.platforms.map(platform =>
                    <div key={platform.id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {platform.name}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnPlatformRemove(platform.id)}><FontAwesomeIcon icon='trash' /> </button>
                        </div>
                      </div>
                    </div>
                  )}
                {(this.state.item.platforms.length === 0) &&
                  <span><i>There are no attached platforms.</i></span>}
              </span>}
            {(this.state.modalMode === 'Result') &&
              <span>
                <b>Attached results:</b><br />
                {(this.state.item.results.length > 0) &&
                  this.state.item.results.map(result =>
                    <div key={result.id}>
                      <hr />
                      <div className='row'>
                        <div className='col-md-10'>
                          {result.task.name}, {result.method.name}, {result.metricName}: {result.metricValue}
                        </div>
                        <div className='col-md-2'>
                          <button className='btn btn-danger' onClick={() => this.handleOnResultRemove(result.id)}><FontAwesomeIcon icon='trash' /> </button>
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
                {(this.state.item.tags.length > 0) &&
                  this.state.item.tags.map(tag =>
                    <div key={tag.id}>
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
        <Modal
          show={this.state.showEditModal}
          onHide={this.handleHideEditModal}
          size='lg'
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modalTextMode === 'Moderation' ? 'Report' : 'Edit'} Submission</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(this.state.modalMode === 'Login') &&
              <span>
                Please <Link to={'/Login/' + encodeURIComponent('Submission/' + this.props.match.params.id)}>login</Link> before {this.state.modalTextMode === 'Moderation' ? 'filing a report' : 'editing'}.
              </span>}
            {(this.state.modalMode !== 'Login') &&
              <span>
                {(this.state.modalMode === 'Moderation') &&
                  <div>
                    <div>
                      <b>Remember that any logged in user can edit any submission. However, if editing won't address the issue, please describe for a moderator what's wrong.</b>
                    </div>
                    <br />
                  </div>}
                {(this.state.modalMode === 'Moderation') &&
                  <FormFieldRow
                    inputName='description' inputType='textarea' label='Description' rows='12'
                    value={this.state.moderationReport.description}
                    onChange={(field, value) => this.handleOnChange('moderationReport', field, value)}
                  />}
                {(this.state.modalMode !== 'Moderation') &&
                  <div>
                    <FormFieldRow
                      inputName='thumbnailUrl' inputType='text' label='Image URL' imageUrl
                      value={this.state.submission.thumbnailUrl}
                      onChange={(field, value) => this.handleOnChange('submission', field, value)}
                    />
                    <FormFieldAlertRow className='text-center'>
                      <b>The image URL is loaded as a thumbnail, for the submission. (For free image hosting, see <a href='https://imgbb.com/' target='_blank' rel='noreferrer'>https://imgbb.com/</a>, for example.)</b>
                    </FormFieldAlertRow>
                    <FormFieldRow
                      inputName='description' inputType='textarea' label='Description' rows='12'
                      value={this.state.submission.description}
                      onChange={(field, value) => this.handleOnChange('submission', field, value)}
                    />
                  </div>}
              </span>}
          </Modal.Body>
          <Modal.Footer>
            {(this.state.modalMode === 'Login') && <Button variant='primary' onClick={this.handleHideEditModal}>Cancel</Button>}
            {(this.state.modalMode !== 'Login') && <Button variant='primary' onClick={this.handleEditModalDone}>Submit</Button>}
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Submission
