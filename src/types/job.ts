export interface Job {
  id: string
  job_number: string
  bid_number: string
  job_location: string
  contractor: string
  rate: string
  fringe: string
  is_rated: string
  start_date: string
  end_date: string
  type: string
  office: string
  pm: string
  job_status: string
  sign_status: string
  "4_type_3": string
  "6_type_3": string
  "8_type_3": string
  sq_post: string
  h_stand: string
  vp: string
  sharps: string
  y_b_lite: string
  r_b_lite: string
  w_b_lite: string
  tma: string
  c_lite: string
  speed_trailer: string
  arrow_board: string
  message_board: string
  uc_post: string
  seq_light: string
  remarks: string
  last_updated_by: string
  last_updated_at: string
  created_at: string
}

export interface ValidationIssue {
  field: string
  label: string
  count: number
  type: "missing" | "invalid"
  affectedJobs: Job[]
}
