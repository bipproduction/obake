export interface ServerProcess {
    pid: number
    name: string
    pm2_env: Pm2Env
    pm_id: number
    monit: Monit
  }
  
  export interface Pm2Env {
    versioning: Versioning
    node_version: string
    version: string
    _pm2_version: string
    unstable_restarts: number
    restart_time: number
    created_at: number
    axm_dynamic: AxmDynamic
    axm_options: AxmOptions
    axm_monitor: AxmMonitor
    axm_actions: AxmAction[]
    pm_uptime: number
    status: string
    unique_id: string
    SHELL: string
    NVM_INC: string
    LANGUAGE: string
    PWD: string
    LOGNAME: string
    XDG_SESSION_TYPE: string
    MOTD_SHOWN: string
    HOME: string
    LANG: string
    SSH_CONNECTION: string
    NVM_DIR: string
    XDG_SESSION_CLASS: string
    TERM: string
    USER: string
    SHLVL: string
    NVM_CD_FLAGS: string
    XDG_SESSION_ID: string
    LC_CTYPE: string
    XDG_RUNTIME_DIR: string
    SSH_CLIENT: string
    LC_ALL: string
    PATH: string
    DBUS_SESSION_BUS_ADDRESS: string
    NVM_BIN: string
    SSH_TTY: string
    _: string
    OLDPWD: string
    PM2_USAGE: string
    PM2_JSON_PROCESSING: string
    NODE_ENV: string
    PM2_HOME: string
    "ninox-fox_3011": string
    NODE_APP_INSTANCE: number
    vizion_running: boolean
    km_link: boolean
    pm_pid_path: string
    pm_err_log_path: string
    pm_out_log_path: string
    exec_interpreter: string
    pm_cwd: string
    pm_exec_path: string
    node_args: any[]
    name: string
    cwd: string
    args: string[]
    env: Env
    vizion: boolean
    autostart: boolean
    autorestart: boolean
    exec_mode: string
    instance_var: string
    pmx: boolean
    automation: boolean
    treekill: boolean
    username: string
    windowsHide: boolean
    kill_retry_time: number
    namespace: string
    pm_id: number
  }
  
  export interface Versioning {
    type: string
    url: string
    revision: string
    comment: string
    unstaged: boolean
    branch: string
    remotes: string[]
    remote: string
    branch_exists_on_remote: boolean
    ahead: boolean
    next_rev: any
    prev_rev: any
    update_time: string
    repo_path: string
  }
  
  export interface AxmDynamic {}
  
  export interface AxmOptions {
    error: boolean
    heapdump: boolean
    "feature.profiler.heapsnapshot": boolean
    "feature.profiler.heapsampling": boolean
    "feature.profiler.cpu_js": boolean
    latency: boolean
    catchExceptions: boolean
    profiling: boolean
    metrics: Metrics
    standalone: boolean
    tracing: Tracing
    module_conf: ModuleConf
    apm: Apm
    module_name: string
    module_version: string
  }
  
  export interface Metrics {
    http: boolean
    runtime: boolean
    eventLoop: boolean
    network: boolean
    v8: boolean
  }
  
  export interface Tracing {
    outbound: boolean
    enabled: boolean
  }
  
  export interface ModuleConf {}
  
  export interface Apm {
    version: string
    type: string
  }
  
  export interface AxmMonitor {
    "Used Heap Size": UsedHeapSize
    "Heap Usage": HeapUsage
    "Heap Size": HeapSize
    "Event Loop Latency p95": EventLoopLatencyP95
    "Event Loop Latency": EventLoopLatency
    "Active handles": ActiveHandles
    "Active requests": ActiveRequests
  }
  
  export interface UsedHeapSize {
    value: string
    type: string
    unit: string
    historic: boolean
  }
  
  export interface HeapUsage {
    value: number
    type: string
    unit: string
    historic: boolean
  }
  
  export interface HeapSize {
    value: string
    type: string
    unit: string
    historic: boolean
  }
  
  export interface EventLoopLatencyP95 {
    value: string
    type: string
    unit: string
    historic: boolean
  }
  
  export interface EventLoopLatency {
    value: string
    type: string
    unit: string
    historic: boolean
  }
  
  export interface ActiveHandles {
    value: number
    type: string
    historic: boolean
  }
  
  export interface ActiveRequests {
    value: number
    type: string
    historic: boolean
  }
  
  export interface AxmAction {
    action_name: string
    action_type: string
    arity: number
  }
  
  export interface Env {
    unique_id: string
    SHELL: string
    NVM_INC: string
    LANGUAGE: string
    PWD: string
    LOGNAME: string
    XDG_SESSION_TYPE: string
    MOTD_SHOWN: string
    HOME: string
    LANG: string
    SSH_CONNECTION: string
    NVM_DIR: string
    XDG_SESSION_CLASS: string
    TERM: string
    USER: string
    SHLVL: string
    NVM_CD_FLAGS: string
    XDG_SESSION_ID: string
    LC_CTYPE: string
    XDG_RUNTIME_DIR: string
    SSH_CLIENT: string
    LC_ALL: string
    PATH: string
    DBUS_SESSION_BUS_ADDRESS: string
    NVM_BIN: string
    SSH_TTY: string
    _: string
    OLDPWD: string
    PM2_USAGE: string
    PM2_JSON_PROCESSING: string
    NODE_ENV: string
    PM2_HOME: string
    "ninox-fox_3011": string
  }
  
  export interface Monit {
    memory: number
    cpu: number
  }
  